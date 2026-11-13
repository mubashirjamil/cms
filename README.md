# CampusFlow — College Management Mini App

A responsive college dashboard built with plain HTML and JavaScript, styled with the Tailwind CSS CLI, and backed by JSON Server.

## Run locally

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. From the project folder, install packages:

   ```bash
   npm install
   ```

3. Start the Tailwind watcher and JSON Server together:

   ```bash
   npm run dev
   ```

4. In a second terminal, serve the static pages:

   ```bash
   npm run serve
   ```

5. Open [http://localhost:5173/signin.html](http://localhost:5173/signin.html) and sign in with the demo account:

   - Email: `admin@northbridge.edu`
   - Password: `Campus123!`

The JSON API runs at [http://localhost:3000/students](http://localhost:3000/students). Student records are stored in `db.json`.

## Available scripts

- `npm run dev` — watches Tailwind source changes and starts JSON Server.
- `npm run css:build` — creates a minified production stylesheet.
- `npm run serve` — serves the `public` folder at port 5173.

The sign-in is a demo flow backed by the `users` collection in `db.json`, with a session kept in the current browser tab. The dashboard includes student search and course/status filters, create/edit/delete student actions, a responsive mobile menu, and overview cards. Courses, faculty, attendance, and fee sections are placeholders for future expansion. This sample authentication is for demonstration only; production accounts need a proper authentication service and hashed passwords.
