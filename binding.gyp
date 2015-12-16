{
    "targets": [
    {
        "target_name": "swiss_ephemeris",
        "sources" : [
            "nodejs_src/SwissEphemeris.cc"
        ],
        "include_dirs": [
            "<!(node -e \"require('nan')\")",
        ],
        "dependencies": [
            "src/libswiss_ephemeris.gypi:libswiss_ephemeris",
        ],
        'direct_dependent_settings': {
            'linkflags': [
                "-lm"
            ]
        }
    } ]
}
