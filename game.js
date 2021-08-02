var tiles = [];
var emptyTiles = [];
let bindings = {};

var OnUpdate = function () { };
var OnFoodSpawn = function () {
    while ( true ) {
        try {
            var randomIndex = Math.floor( Math.random() * ( emptyTiles.length - 1 ) );
            tiles[ emptyTiles[ randomIndex ] ].tile.ReceiveFood();
            break;
        } catch ( e ) { }
    }
};

function InitiateNewGame () {
    tiles = [];
    var canvasSize = 60;
    var body = document.querySelectorAll( 'body' )[ 0 ];

    while ( body.children.length > 0 )
        body.removeChild( body.children[ 0 ] );

    for ( var i = 0; i < ( canvasSize + 2 ); i++ ) {
        for ( var j = 0; j < ( canvasSize + 2 ); j++ ) {
            var tileId = 'tile' + tiles.length;

            var div = document.createElement( 'div' );
            div.setAttribute( 'id', tileId );

            body.appendChild( div );

            var tileObj = {};
            tileObj.element = div;
            tileObj.tile = new EmptyTile( tiles.length );
            tileObj.element.setAttribute( 'class', tileObj.tile.styleClassName );
            tiles.push( tileObj );
        }
        body.appendChild( document.createElement( 'br' ) );
    }

    //top walls
    for ( var i = 1; i < ( canvasSize + 1 ); i++ ) {
        tiles[ i ].tile.BecomeWall();
    }

    //bottom walls
    for ( var i = tiles.length - 1; i > ( tiles.length - ( canvasSize + 1 ) ); i-- ) {
        tiles[ i - 1 ].tile.BecomeWall();
    }

    //left walls
    for ( var i = 0; i < ( canvasSize + 2 ); i++ ) {
        var index = ( canvasSize + 2 ) * i;
        tiles[ index ].tile.BecomeWall();
    }

    //right walls
    for ( var i = 0; i < ( canvasSize + 2 ); i++ ) {
        var index = ( canvasSize + 1 ) + ( canvasSize + 2 ) * i;
        tiles[ index ].tile.BecomeWall();
    }

    //add 2 foods
    for ( var i = 0; i < 2; i++ ) {
        OnFoodSpawn();
    }

    var snake = new Snake( canvasSize );
    OnUpdate = function () {
        snake.Update();
    };


    bindings = {};

    bindings[ 'w' ] = function () {
        snake.SetDirection( 'up' );
    };
    bindings[ 's' ] = function () {
        snake.SetDirection( 'down' );
    };
    bindings[ 'a' ] = function () {
        snake.SetDirection( 'left' );
    };
    bindings[ 'd' ] = function () {
        snake.SetDirection( 'right' );
    };

    bindings[ 'ArrowUp' ] = function () {
        snake.SetDirection( 'up' );
    };
    bindings[ 'ArrowDown' ] = function () {
        snake.SetDirection( 'down' );
    };
    bindings[ 'ArrowLeft' ] = function () {
        snake.SetDirection( 'left' );
    };
    bindings[ 'ArrowRight' ] = function () {
        snake.SetDirection( 'right' );
    };

    OnFoodEaten = function () {
        snake.size++;
    };

};

//base events
var OnDeath = function () {
    InitiateNewGame();
};

var OnFoodEaten = function () { };


var OnMorphTile = function ( index, newTile ) {
    tiles[ index ].element.setAttribute( 'class', newTile.styleClassName );
    tiles[ index ].tile = newTile;
};

function WallTile () {
    this.styleClassName = 'wall';
    this.ReceiveSnake = function () {
        OnDeath();
    };
};

function SnakeTile ( index ) {
    this.styleClassName = 'snake';
    this.ReceiveSnake = function () {
        OnDeath();
    };

    this.RemoveSnake = function () {
        OnMorphTile( index, new EmptyTile( index ) );
    };
};

function EmptyTile ( index ) {
    emptyTiles.push( index );
    this.styleClassName = 'empty';
    this.ReceiveSnake = function () {
        emptyTiles.slice( index, index + 1 );
        OnMorphTile( index, new SnakeTile( index ) );
    };

    this.ReceiveFood = function () {
        emptyTiles.slice( index, index + 1 );
        OnMorphTile( index, new FoodTile( index ) );
    };

    this.BecomeWall = function () {
        emptyTiles.slice( index, index + 1 );
        OnMorphTile( index, new WallTile() );
    };
};

function FoodTile ( index ) {
    this.styleClassName = 'food';
    this.ReceiveSnake = function () {
        OnFoodEaten();
        OnFoodSpawn();
        OnMorphTile( index, new SnakeTile( index ) );
    };
};

var Snake = function ( sizeOfTable ) {
    //directions
    var availableDirections = [];
    availableDirections[ 'up' ] = -( sizeOfTable + 2 );
    availableDirections[ 'down' ] = ( sizeOfTable + 2 );
    availableDirections[ 'right' ] = 1;
    availableDirections[ 'left' ] = -1;

    //snake starts going down
    var jumpBloks = availableDirections[ 'down' ];

    //calculate the starting point and set it as the head
    var totalSize = sizeOfTable + 2;
    var delta = ( totalSize / 2 ) - 1;
    var middle = totalSize * delta + delta;

    var headIndex = Math.ceil( middle );

    //let the tile knows that it should start as a snake
    tiles[ headIndex ].tile.ReceiveSnake();

    //set the starting size as 1 (+head, so 2)
    this.size = 1;

    //defines the body
    var body = [];

    this.SetDirection = function ( directionName ) {
        jumpBloks = availableDirections[ directionName ];
    };

    this.Update = function () {
        body.push( headIndex );

        //clean the first tiles
        while ( body.length > this.size ) {
            tiles[ body.shift() ].tile.RemoveSnake();
        }

        headIndex += jumpBloks;
        tiles[ headIndex ].tile.ReceiveSnake();
    };
};

window.addEventListener( 'load', function () {
    //boot game
    InitiateNewGame();

    //handle user input
    window.addEventListener( 'keydown', function ( e ) {
        let key = e.key;

        let callback = bindings[ key ];// || ( function () { } );
        callback();
    } );

    //callupdate every second
    //game loop
    setInterval( function () {
        OnUpdate();
    }, 50 );
} );