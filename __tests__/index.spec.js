jest.mock('../lib/env')
jest.mock('cross-spawn-with-kill', () => {
  return jest.genMockFromModule('cross-spawn-with-kill')
})
jest.mock('find-up', () => {
  return jest.genMockFromModule('find-up')
})

const mockedEnv = require('../lib/env')
const mockedSpawn = require('cross-spawn-with-kill')
const mockedFindUp = require('find-up')
const init = require('../index')

const makeBundler = options => {
  return {
    options,
    __listeners: {
      // including just to make empty assertions easier
      buildEnd: [],
    },
    __raise: function(evt) {
      this.__listeners[evt].forEach(e => {
        e()
      })
    },
    on: function(evt, cb) {
      if (!this.__listeners[evt]) {
        this.__listeners[evt] = []
      }
      this.__listeners[evt].push(cb)
    },
  }
}

describe('index', () => {
  it('should default on for electron watch', () => {
    mockedEnv.mockReturnValueOnce(0)
    mockedFindUp.sync.mockReturnValueOnce('valid/path')

    const instanceBundler = makeBundler({
      watch: true,
      target: 'electron',
    })

    init(instanceBundler)

    expect(instanceBundler.__listeners['buildEnd'].length).toBe(1)
  })

  it('should default off when !watch', () => {
    mockedEnv.mockReturnValueOnce(0)
    const instanceBundler = makeBundler({
      watch: false,
      target: 'electron',
    })

    init(instanceBundler)

    expect(instanceBundler.__listeners['buildEnd'].length).toBe(0)
  })

  it('should default off when !electron', () => {
    mockedEnv.mockReturnValueOnce(0)
    const instanceBundler = makeBundler({
      watch: true,
      target: 'not-electron',
    })

    init(instanceBundler)

    expect(instanceBundler.__listeners['buildEnd'].length).toBe(0)
  })

  it('should be forced on', () => {
    mockedEnv.mockReturnValueOnce('1')
    mockedFindUp.sync.mockReturnValueOnce('valid/path')

    const instanceBundler = makeBundler({
      watch: false,
      target: 'not-electron',
    })

    init(instanceBundler)

    expect(instanceBundler.__listeners['buildEnd'].length).toBe(1)
  })

  it('should be forced off', () => {
    mockedEnv.mockReturnValueOnce('0')

    const instanceBundler = makeBundler({
      watch: true,
      target: 'electron',
    })

    init(instanceBundler)

    expect(instanceBundler.__listeners['buildEnd'].length).toBe(0)
  })

  it('should trigger (and retrigger)', () => {
    const expectedPath = 'valid/path'
    const mockKill = jest.fn()
    mockedEnv.mockReturnValueOnce('1')
    mockedFindUp.sync.mockReturnValueOnce(`${expectedPath}/file.txt`)
    mockedSpawn.mockReturnValueOnce({
      kill: mockKill,
    })

    const instanceBundler = makeBundler({
      watch: false,
      target: 'not-electron',
    })

    init(instanceBundler)

    instanceBundler.__raise('buildEnd')

    expect(mockedSpawn).toHaveBeenCalledTimes(1)
    expect(mockedSpawn).toHaveBeenCalledWith('electron', [expectedPath], {
      stdio: 'inherit',
    })
    expect(mockKill).toHaveBeenCalledTimes(0)

    instanceBundler.__raise('buildEnd')

    expect(mockKill).toHaveBeenCalledTimes(1)
  })
})
