/*
    Nakadachi, A simple hook library made for intercepting
    XHR and experimental Fetch API requests.

    Written by Botaro Shinomiya (citrizon)

    This is free and unencumbered software released into the public domain.

    Anyone is free to copy, modify, publish, use, compile, sell, or
    distribute this software, either in source code form or as a compiled
    binary, for any purpose, commercial or non-commercial, and by any
    means.

    In jurisdictions that recognize copyright laws, the author or authors
    of this software dedicate any and all copyright interest in the
    software to the public domain. We make this dedication for the benefit
    of the public at large and to the detriment of our heirs and
    successors. We intend this dedication to be an overt act of
    relinquishment in perpetuity of all present and future rights to this
    software under copyright law.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
    ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    For more information, please refer to <https://unlicense.org>
*/

const errors = require( './errors' );
const descriptor = require( './descriptor' );

const hookOriginals = {
    XMLHttpRequestSend: undefined,
    XMLHttpRequestOpen: undefined,
    XMLHttpRequestHead: undefined,
    FetchAPI: undefined
};

let middleware = async function ( request ) { return request; };

function PerformHook ( XMLHttpRequestAPI, FetchAPI ) {
    if ( descriptor.toObject( XMLHttpRequestAPI )?.prototype?.__hooked || descriptor.toObject( FetchAPI )?.__hooked )
        throw new Error( 'XMLHttpRequest and/or FetchAPI has been already hooked.' );
    if ( descriptor.toObject( XMLHttpRequestAPI ) ) {
        XMLHttpRequestAPI = descriptor.toObject( XMLHttpRequestAPI );
        hookOriginals.XMLHttpRequestSend = XMLHttpRequestAPI.prototype.send;
        hookOriginals.XMLHttpRequestOpen = XMLHttpRequestAPI.prototype.open;
        hookOriginals.XMLHttpRequestHead = XMLHttpRequestAPI.prototype.setRequestHeader;
        XMLHttpRequestAPI.prototype.open = function ( method, url, isAsync = true, username = undefined, password = undefined  ) {
            this.__fakeRequest = {
                url,
                method,
                isAsync,
                headers: username ? { 'Authorization': [ `Basic ${ btoa( username + ':' + password ) }` ] } : {}
            };
            this.readyState = 1;
            this.dispatchEvent( new Event( 'readystatechange' ) );
        }
        XMLHttpRequestAPI.prototype.setRequestHeader = function ( header, value ) {
            if ( !this.__fakeRequest )
                throw new Error( "Failed to execute 'setRequestHeader' on 'XMLHttpRequest': The object's state must be OPENED." );
            if ( !this.__fakeRequest.headers[ header ] )
                this.__fakeRequest.headers[ header ] = [];
            this.__fakeRequest.headers[ header ].push( value );
        }
        XMLHttpRequestAPI.prototype.send = function ( body ) {
            const req = new Request( this.__fakeRequest.url, {
                headers: Object.fromEntries( Object.entries( this.__fakeRequest.headers ).map( e => [ e[0], e[1].join( ', ' ) ] ) ),
                body
            } );
            middleware( req ).then( e => {
                if ( e !== null && e !== undefined && !( e instanceof Request ) )
                    throw new errors.NakadachiException( 'Intercepted object is not an instance of Request class.' );
                const newReq = e ?? req;
                hookOriginals.XMLHttpRequestOpen.call( this, newReq.method, newReq.url, this.__fakeRequest.isAsync );
                for ( const [ name, value ] of newReq.headers ) {
                    hookOriginals.XMLHttpRequestHead.call( this, name, value );
                }
                hookOriginals.XMLHttpRequestSend.call( this, newReq.body );
            } );
        }
    }
    if ( descriptor.toObject( FetchAPI ) ) {
        hookOriginals.FetchAPI = descriptor.toObject( FetchAPI )
        descriptor.assignToDescriptor( FetchAPI, async function ( resource, options ) {
            let req = new Request( resource, options );
            let output = await middleware( req );
            const newReq = output ?? req;
            return await hookOriginals.FetchAPI.call( FetchAPI.parent, newReq );
        } )
    }
}

function SetTargetRunner ( asyncfunc ) {
    middleware = asyncfunc;
}

module.exports = {
    PerformHook,
    SetTargetRunner
};
