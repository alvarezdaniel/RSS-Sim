//console.log('Hello world');

var net = require( 'net' );

var sockets = [];

/*
 * Cleans the input of carriage return, newline
 */
function cleanInput( data ) {
    return data.toString().replace( /(\r\n|\n|\r)/gm, "" );
}

function toHex( data ) {
  return data.split( '' ).map( function ( c ) { return c.charCodeAt( 0 ); })
}

/*
 * Method executed when data is received from a socket
 */
function receiveData( socket, data ) {
    var cleanData = cleanInput(data);

    var bufIn = new Buffer(data);
    
    //console.log( data.toString() );
    console.log(bufIn);

    if ( cleanData === "@quit" ) {
        socket.end( 'Goodbye!\n' );
    }
    else {
        for ( var i = 0; i < sockets.length; i++ ) {
            
            //if ( sockets[i] !== socket ) {
            //    sockets[i].write( data );
            //}

            if ( sockets[i] == socket ) {
                
                // If in=MSG_CONNECT_REQ, out=MSG_CONNECT_RSP
                if ((bufIn[0] == 214) && (bufIn[3] == 0x00) && (bufIn[4] == 0x72)) {
                    var buffer = new Buffer( 
                        [ 
                          214,         // MessageClass: Class Management
                          0, 20,       // Message Length = 2 + 18
                          0x00, 0x73,  // Message Type: Msg_Connect_Rsp = 115
                          1,           // DomainID 
                          1,           // ShortTSMCID
                          1,           // Tolling Segment ID
                          ' ', ' ',    // two space for Connect Rsp 
                          1, 0, 0, 0,  // Sequential msg number
                          1, 0, 0, 0,  // Unix time seconds
                          1, 0, 0, 0,  // Unix time microseconds
                          0            // Log-on result = OK
                          ] );
                    console.log(buffer);
                    sockets[i].write( buffer );
                }
                
                // If in=MSG_SET_TIME_REQ, out=
                else  if ((bufIn[0] == 214) && (bufIn[3] == 0x00) && (bufIn[4] == 0x04)) {
                
                }

            }

        }
    }
}

/*
 * Method executed when a socket ends
 */
function closeSocket( socket ) {
    var i = sockets.indexOf( socket );
    if ( i != -1 ) {
        sockets.splice( i, 1 );
    }
}

/*
 * Callback method executed when a new TCP socket is opened.
 */
function newSocket( socket ) {
    sockets.push( socket );
    //socket.write('Welcome to the Telnet server!\n');
    socket.on( 'data', function ( data ) {
        receiveData( socket, data );
    })
	socket.on( 'end', function () {
        closeSocket( socket );
    })
}

// Create a new server and provide a callback for when a connection occurs
var servera = net.createServer( newSocket );
var serverb = net.createServer( newSocket );
var serverc = net.createServer( newSocket );

// Listen on port 8888
servera.listen(53000);
serverb.listen(53100);
serverc.listen(53200);

console.log( 'listening on ports 53000, 53100, 53200' );
