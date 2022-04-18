
# Civ Royale

An open, hack and slash style game in which players compete and collaborate on a large map to expand their civilization.



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in apps/client

`VITE_SERVER_URL=ws://localhost:2567`


## Run Locally (Requires Yarn)

Clone the project

```bash
  git clone https://github.com/LehuyH/civ-royale
```

Go to the project directory

```bash
  cd civ-royale
```

Install dependencies

```bash
  yarn install
```

Start the server

```bash
yarn dev:server
```

Start the client

```bash
yarn dev:client
```