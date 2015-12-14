cmake_minimum_required (VERSION 2.6)

project( swiss_ephemeris )
set( swiss_ephemeris_VERSION_MAJOR 2 )
set( swiss_ephemeris_VERSION_MINOR 04 )

set( CMAKE_C_FLAGS "-Wall -Wextra -Werror -Wno-error=missing-field-initializers -Wno-error=unused-parameter -Wno-error=unused-but-set-variable" )

add_library( swe
    src/swedate.c
    src/swehouse.c
    src/swejpl.c
    src/swemmoon.c
    src/swemplan.c
    src/swepcalc.c
    src/sweph.c
    src/swepdate.c
    src/swephlib.c
    src/swecl.c
    src/swehel.c
)

add_executable( swetest
    src/swetest.c
)

add_executable( swemini
    src/swemini.c
)

target_link_libraries( swetest swe m )
target_link_libraries( swemini swe m )
