// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  apiUrl: 'http://127.0.0.1:5000',
  skip_login: true,
  test_user : 'raushan2003@gmail.com'
  // cognitoDomain:'showcase-app.auth.us-east-1.amazoncognito.com',
  // cognitoClientId: '698cc0ufsvh074rm4ti6ch3cl3',
  // cognitoLogin: 'http://127.0.0.1:5000/login'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
