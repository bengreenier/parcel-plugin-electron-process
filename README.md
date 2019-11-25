# parcel-plugin-electron-process

Parcel development plugin that spawns and re-spawns an electron process. 🧬📦⚙

I needed a plugin that would allow me to run electron automatically, when parcel built my code successfully (on [`buildEnd`](https://parceljs.org/api.html#events)) to imitate the behavior that occurs when building for the browser. However, [better electron support hasn't landed yet](https://github.com/parcel-bundler/parcel/issues/2492) - so I created this.

## Usage

In any [Parcel](https://parceljs.org/getting_started.html) project:

```
# -D installs as a devDependency
npm install -D parcel-plugin-electron-process

# Use it
parcel --target electron path/to/file.ext

# Use it (forcably, with a non-electron target)
npx cross-env PARCEL_PLUGIN_ELECTRON_PROC=1 parcel --target node path/to/file.ext

# Disable it (with an electron target)
npx cross-env PARCEL_PLUGIN_ELECTRON_PROC=0 parcel --target electron path/to/file.ext
```

### Notes

- After install, parcel will [autodetect the plugin](https://parceljs.org/plugins.html#using-plugins) and begin using it.
- `PARCEL_PLUGIN_ELECTRON_PROC` overrides the default detection case (`1` or `0`)
- By default, the plugin is only active when `target=electron` and `watch=true`
