# dpc-connections-sentimenter

Instructions:

This sample application extracts the forum posts and replies from an IBM Connections Community, and then invokes the Watson Natural Language Understanding API to get sentiment and tone of the content.

## Getting started

1. Copy the file `local.env.sample` to `local.env`.

1. Edit the file to provide your Connections server's host name, and an ID and password. You'll also need to provide your Watson NLU credentials. Setting `RUN_MODE` to `TEST` will return test data instead of calling Connections or Watson.  Setting it to `PROD` will call those systems.

1. Download `date.format.js` from [https://gist.github.com/jhbsk/4690754](https://gist.github.com/jhbsk/4690754) and copy it to the `public/js` directory.

1. Download `jquery.loadmask.min.js` from [https://github.com/wallynm/jquery-loadmask](https://github.com/wallynm/jquery-loadmask) and copy it to the `public/js` directory.

1. Install the dependencies your application needs:

  ```none
  npm install
  ```

6. Start the application locally:

  ```
  npm start
  ```

7. Point your browser to [http://localhost:3001](http://localhost:3001).

Please read the LICENSE file for copyright and license information!
