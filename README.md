# Nakadachi
A simple hook library made for intercepting XHR and experimental Fetch API requests. You can install this library and start using it by running this command:
```
npm i nakadachi
```
> [!IMPORTANT]
> If you want to use this on the web, you can go to the [Releases](https://github.com/citrizon/nakadachi/releases) and download it or you can copy the link directly.
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
Nakadachi.hook( function ( request ) {
    console.log( request );
} );

// Now let's test it out!!!
fetch( 'https://echo.free.beeceptor.com' );
```
