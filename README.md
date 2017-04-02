## Tweaking The Admin

If you want to modify the admin configuration and see how it affects the admin, you'll need to install the build tools.

```sh
## install npm dependencies
make install
## run the server
make run
```

You can now open `http://localhost:8080/webpack-dev-server/`. Every change in the source will reload the page in the browser.

## Pushing an update

You'll need to build the minified source before releasing a new version.

```sh
# update the files under build/
make build
```
