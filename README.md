# Parking lanes viewer for OpenStreetMap

- [Open the viewer](https://zlant.github.io/parking-lanes/#16/52.4751/13.4435)
- Learn more about the project [in the launch post](https://www.openstreetmap.org/user/acsd/diary/45026).

## Screenshots

Viewer: 

<img src="https://i.imgur.com/VwH7Hmh.png" alt="Viewer UI">

Editor:

<img src="https://i.imgur.com/e0vsqUQ.png" alt="Editor UI">


# Using correct Node version
The correct Node version is specified in `.nvmrc`.

For an easy way to automatically use this Node version just for your current shell:

- Install `nvm`
  - Using the [install script]https://github.com/nvm-sh/nvm#install--update-script)
  - Or using [Homebrew](https://formulae.brew.sh/formula/nvm)
- Run `nvm use` to automatically use the Node version specified in the `.nvmrc`. You may need to
  `nvm install`.

## Install git hook

Run `npm run prepare`. This will install [Husky](https://github.com/typicode/husky), which will automatically run the command in `.husky/pre-commit` before commiting.

This prevents commits that fail typecheck or the linter being committed (you can always add a type or linter ignore though).
