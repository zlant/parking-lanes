# Parking lanes viewer for OpenStreetMap

- [Open the viewer](https://zlant.github.io/parking-lanes/#16/52.4751/13.4435)
- Learn more about the project [in the launch post](https://www.openstreetmap.org/user/acsd/diary/45026).

## Screenshots

Viewer: 

<img src="https://i.imgur.com/VwH7Hmh.png" alt="Viewer UI">

Editor:

<img src="https://i.imgur.com/e0vsqUQ.png" alt="Editor UI">

# Local Development

- Install dependencies: `npm install`
- Start Webpack dev server: `npm run start`

Geolocation won't work over http. [ngrok](https://ngrok.com/docs) can start an HTTPS tunnel to your
localhost with the following command:

`ngrok http --host-header=rewrite 33444`