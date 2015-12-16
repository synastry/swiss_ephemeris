'use strict';

var addon = require( 'bindings' )( 'swiss_ephemeris' );
var _assign = require('lodash.assign');

/**
 * @const
 */
var consts = {
    Sun : 0,
    Moon : 1,
    Mercury : 2,
    Venus : 3,
    Mars : 4,
    Jupiter : 5,
    Saturn : 6,
    Uranus : 7,
    Neptune : 8,
    Pluto : 9,
    meanNode : 10,

    defaultList : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
};

/**
 * Asynchornous callback prototype, if FutoIn async steps is not used
 *
 * @callback AstroMetricsCallback
 * @param {object} result
 * @param {string} error
 */

/**
 * Returned by module invocation
 * @class
 */
function SwissEphemeris( datetime )
{
    this._dt = datetime;
}

SwissEphemeris.prototype = {
    /**
     * Calculate planets astronomical metrics (optimized for multiple)
     * @param {AsyncSteps} as - FutoIn AsyncSteps reference by convention
     * @param {integer[]} planets==defaultList - list of planets to calculate
     */
    calcAll : function( as, planets )
    {
        var that = this;

        as.add( function( as )
        {
            that.calcAllCB( function( res, err )
            {
                if ( err )
                {
                    as.error( "UnknownError", err );
                }
                else
                {
                    as.success( res );
                }
            }, planets );
            
            as.setCancel( function(){} );
        } );
    },

    /**
     * Calculate single planet astronomical metrics
     * @param {AsyncSteps} as - FutoIn AsyncSteps reference by convention
     * @param {integer} planet_id - list of planets to calculate
     */
    calcPlanet : function( as, planet_id )
    {
        var that = this;

        as.add( function( as )
        {
            that.calcPlanetCB( function( res, err )
            {
                if ( err )
                {
                    as.error( "UnknownError", err );
                }
                else
                {
                    as.success( res );
                }
            }, planet_id );

            as.setCancel( function(){} );
        } );
    },

    /**
     * Calculate planets astronomical metrics (optimized for multiple)
     * @param {AstroMetricsCallback} callback - simple callback
     * @param {integer[]} planets==defaultList - list of planets to calculate
     */
    calcAllCB : function( callback, planets )
    {
        var required = planets || this.defaultList;
        return addon.calcAll( callback, this._dt, required );
    },

    /**
     * Calculate single planet astronomical metrics
     * @param {AstroMetricsCallback} callback - simple callback
     * @param {integer} planet_id - list of planets to calculate
     */
    calcPlanetCB : function( callback, planet_id )
    {
        return addon.calcPlanet( callback, this._dt, planet_id );
    },
};

/**
 * Get info access basaed on datetime object
 * @param {Date} datetime - date & time of interest in UTC
 * @param {object=} position - unused
 */
module.exports = exports = function( datetime, position )
{
    if ( !exports._initDone )
    {
        module.exports.setSwissEphemerisPath(
                __dirname + '/../../swiss_ephemeris_data:' +
                __dirname + '/../node_modules/swiss_ephemeris_data' );
    }

    return new SwissEphemeris( datetime, position );
};

/**
 * Set Swiss Ephemeris data path
 * @param {string} path - Path to ephemeris data
 */
exports.setSwissEphemerisPath = function( path )
{
    exports._initDone = true;
    return addon.swissEphemerisPath( path );
};

_assign( exports, consts );
_assign( SwissEphemeris.prototype, consts );
