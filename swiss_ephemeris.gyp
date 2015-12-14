{
    "targets": [
    {
        "target_name": "swiss_ephemeris",
        'type': 'shared_library',
        "sources" : [
            "src/swedate.c",
            "src/swehouse.c",
            "src/swejpl.c",
            "src/swemmoon.c",
            "src/swemplan.c",
            "src/swepcalc.c",
            "src/sweph.c",
            "src/swepdate.c",
            "src/swephlib.c",
            "src/swecl.c",
            "src/swehel.c",
        ],
        'direct_dependent_settings': {
            'linkflags': [
                "-lm"
            ]
        }
    } ]
}