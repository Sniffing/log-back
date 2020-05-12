### Todos
1. The result from google cloud are paginated, need to account for this.
~~2. Implement end point for life events~~
3. Review caching for the simple get all query on both text and keywords, should cache that too?

# Set up
Outside of the fileds included in with this repo, an additional three addition things are needed:
1. `.env` file in `src` which holds the Google App Id.
2. `credentials.json` file which holds credentials for a service account for the google app/
3. Export `GOOGLE_APPLICATION_CREDENTIALS` in `~/.bash_profile` and set it to the location of `credentials.json`

Anyone snooping on this project can create their own personal GCP project and reap the benefits of this 
application by ensuring the three steps above are done.

## log-back
Back-end server for log.

## Starting the application
Consult `package.json` for a list of availbale commands. Some basic ones are:
1. `npm start` - start the server
2. `npm test` - run tests

## Interacting with other applications
To allow this application to be hit by the mobile app, you can use a service like ngrok.
ngrok will expose your port to the internet and allow connections from the web.

```
ngrok http 4000
```
