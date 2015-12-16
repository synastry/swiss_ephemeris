'use strict';

require('chai').should();

var astro_ephemeris = require( '../index' )
var $as = require( 'futoin-asyncsteps' )

/*
./swetest -b16.12.2015 -ut21:00:00 
date (dmy) 16.12.2015 greg.   21:00:00 UT               version 2.04
UT: 2457373.375000000     delta t: 67.992576 sec
ET: 2457373.375786951
Epsilon (true)    23°26' 4.1273
Nutation          -0° 0' 1.2735   -0° 0' 9.8048
Sun              264°34'47.1338    0° 0' 0.1954    0.984152925    1° 1' 3.5985
Moon             331°52'21.5324    2° 5'36.5678    0.002502658   13°48'34.4436
Mercury          280°19' 4.3320   -2°16'19.1216    1.252289168    1°30' 0.0848
Venus            223°50'34.2652    2°16'20.2535    1.067007196    1°11'37.5556
Mars             200° 0'32.1034    1°29' 8.5460    1.827572926    0°34'25.6674
Jupiter          172°27'13.8716    1°10'14.9293    5.286216357    0° 4' 7.8566
Saturn           249°26'15.1949    1°37'43.7523   10.955000853    0° 6'57.3576
Uranus            16°35'43.8859   -0°38'38.5873   19.586981816   -0° 0'28.6992
Neptune          337°14'45.4091   -0°47'53.1642   30.238541215    0° 0'57.3764
Pluto            284°32' 8.8327    1°36'48.0373   33.927095011    0° 1'58.6187
mean Node        176°24'35.2961    0° 0' 0.0000    0.002569555   -0° 3'10.6446
true Node        176°22'45.4262    0° 0' 0.0000    0.002612393   -0° 2' 7.3019
mean Apogee      192°35'31.8463    1°26'15.2359    0.002710625    0° 6'39.0290
*/

    var test_vector = [
        "Sun              264°34'47.1338    0° 0' 0.1954    0.984152925    1° 1' 3.5985",
        "Moon             331°52'21.5324    2° 5'36.5678    0.002502658   13°48'34.4436",
        "Mercury          280°19' 4.3320   -2°16'19.1216    1.252289168    1°30' 0.0848",
        "Venus            223°50'34.2652    2°16'20.2535    1.067007196    1°11'37.5556",
        "Mars             200° 0'32.1034    1°29' 8.5460    1.827572926    0°34'25.6674",
        "Jupiter          172°27'13.8716    1°10'14.9293    5.286216357    0° 4' 7.8566",
        "Saturn           249°26'15.1949    1°37'43.7523   10.955000853    0° 6'57.3576",
        "Uranus            16°35'43.8859   -0°38'38.5873   19.586981816   -0° 0'28.6992",
        "Neptune          337°14'45.4091   -0°47'53.1642   30.238541215    0° 0'57.3764",
        "Pluto            284°32' 8.8327    1°36'48.0373   33.927095011    0° 1'58.6187",
        "mean Node        176°24'35.2961    0° 0' 0.0000    0.002569555   -0° 3'10.6446",
    ];
    var test_extract_regex = /^([a-z ]+)\s+([0-9]+)°([0-9 ]+)'([0-9. ]+)\s+(-?)([0-9]+)°([0-9 ]+)'([0-9. ]+)\s+([0-9.]+)\s+(-?)([0-9]+)°([0-9 ]+)'([0-9. ]+)$/i;

describe('astro_ephemeris', function(){
    describe( 'callAll', function(){
        it( 'should provide correct data', function( done ){
            $as().add(
                function( as )
                {
                    astro_ephemeris( new Date('2015-12-16T21:00:00Z') )
                        .calcAll( as );
                        
                    as.add( function( as, result ){
                        var m, t, r;
                        var name, longp, lattp, dist, speed;
                        for ( var i = 0; i <  test_vector.length; ++i ){
                            t = test_vector[i];
                            m = t.match( test_extract_regex );
                            
                            name = m[1].trim();
                            longp = Number( m[2].trim() ) + m[3].trim() / 60 + m[4].trim() / 3600;
                            lattp = Number( m[6].trim() ) + m[7].trim() / 60 + m[8].trim() / 3600;
                            if ( m[5] == '-' ) lattp *= -1; // -0° handling
                            dist = Number( m[9].trim() );
                            speed = Number( m[11].trim() ) + m[12].trim() / 60 + m[13].trim() / 3600;
                            if ( m[10] == '-' ) speed *= -1; // -0° handling
                            
                            r = result[name];
                            /*console.log( r );
                            console.log( m );
                            console.log( name, longp, lattp, dist, speed );*/

                            r.planet.should.equal( name );
                            r.longitude.toFixed(5).should.equal( longp.toFixed(5) );
                            r.latitude.toFixed(5).should.equal( lattp.toFixed(5) );
                            r.longitude_speed.toFixed(5).should.equal( speed.toFixed(5) );
                            r.distance.toFixed(5).should.equal( dist.toFixed(5) );
                        }
                        
                        done();
                    });
                },
                function( as, err )
                {
                    done( err + ": " + as.state.error_info );
                }
            ).execute();
        });
    });
    describe( 'calcPlanet', function(){
        it( 'should provide correct data', function( done ){
            $as().add(
                function( as )
                {
                    astro_ephemeris( new Date('2015-12-16T21:00:00Z') )
                        .calcPlanet( as, astro_ephemeris.Mercury );
                        
                    as.add( function( as, r ){
                        var m, t, r;
                        var name, longp, lattp, dist, speed;

                            t = test_vector[2];
                            m = t.match( test_extract_regex );
                            
                            name = m[1].trim();
                            longp = Number( m[2].trim() ) + m[3].trim() / 60 + m[4].trim() / 3600;
                            lattp = Number( m[6].trim() ) + m[7].trim() / 60 + m[8].trim() / 3600;
                            if ( m[5] == '-' ) lattp *= -1; // -0° handling
                            dist = Number( m[9].trim() );
                            speed = Number( m[11].trim() ) + m[12].trim() / 60 + m[13].trim() / 3600;
                            if ( m[10] == '-' ) speed *= -1; // -0° handling
                            
                            /*console.log( r );
                            console.log( m );
                            console.log( name, longp, lattp, dist, speed );*/

                            r.planet.should.equal( name );
                            r.longitude.toFixed(5).should.equal( longp.toFixed(5) );
                            r.latitude.toFixed(5).should.equal( lattp.toFixed(5) );
                            r.longitude_speed.toFixed(5).should.equal( speed.toFixed(5) );
                            r.distance.toFixed(5).should.equal( dist.toFixed(5) );
                        
                        done();
                    });
                },
                function( as, err )
                {
                    done( err + ": " + as.state.error_info );
                }
            ).execute();
        });
    });
});
