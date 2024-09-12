![image](https://github.com/user-attachments/assets/1ec88525-bad3-4061-86fe-3731941fc57f)

A simple hook library made for intercepting XHR and experimental Fetch API requests. You can install this library and start using it by running this command:
```
npm i nakadachi
```
### Manual Installation
For manual installation, make sure that you have [Tabane](https://github.com/tabaneproject/tabane/) installed. After that, clone this repository by running this command:
```
git clone https://github.com/citrizon/nakadachi
```
After that, change your working directory using `cd nakadachi` so we can get to the next step, building! To build Nakadachi, you can simply run:
```
tabane make
```
and you will have your bundled output inside `build/` directory.
### Example use
```js
// Import Nakadachi
const Nakadachi = require( 'nakadachi' );

// Using default hooks, knowing that 
// we have fetch and XMLHttpRequest
// in the global context
const Instance = Nakadachi.hook();

// We can now intercept packages
Instance.listen( function ( method, url, body, headers ) {
    console.log( method, url, body, headers );
} );

// Now let's test it out!!!
fetch( 'https://echo.free.beeceptor.com' );
```
