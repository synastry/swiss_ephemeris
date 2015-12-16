
extern "C" {
#       include "../src/swephexp.h"
}

#include <nan.h>
#include <vector>
#include <string>
#include <tuple>
#include <cstdlib>

class AsyncCalc :
    public Nan::AsyncWorker
{
    union AstroData
    {
        struct
        {
            double longitude;
            double latitude;
            double distance;
            double longitude_speed;
            double latitude_speed;
            double distance_speed;
        };
        double data[6];
    };
    
    struct Result
    {
        int planet;
        std::string planet_name;
        AstroData metrics;
    };

public:
    AsyncCalc( Nan::Callback* callback, double dt, int planet ) :
        AsyncWorker( callback ),
        single_( true ),
        datetime_( dt ),
        planets_{ planet }
    {}

    AsyncCalc( Nan::Callback* callback, double dt, const std::vector<int> &&planets ) :
        AsyncWorker( callback ),
        single_( false ),
        datetime_( dt ),
        planets_( planets )
    {}
    
    virtual void Execute()
    {
        Result result;
        char serr[256];
        int iflag = SEFLG_SWIEPH | SEFLG_SPEED;

        for ( auto p: planets_ )
        {
            result.planet = p;
            auto ret = ::swe_calc_ut( datetime_, p, iflag, result.metrics.data, serr );
            
            if ( ret != iflag )
            {
                SetErrorMessage( serr );
                return;
            }
            
            char planet_name_c[256];
            ::swe_get_planet_name( p, planet_name_c );
            result.planet_name = planet_name_c;
            
            result_.push_back( result );
        }
    }
    
protected:
    bool single_;
    double datetime_;
    std::vector<int> planets_;
    std::vector<Result> result_;
    
    virtual void HandleOKCallback()
    {
        Nan::HandleScope scope;
        v8::Local<v8::Object> single_res;
        v8::Local<v8::Value> overall_result;
        
        if ( single_ )
        {
            MakeResult( 0, single_res );
            overall_result = single_res;
        }
        else
        {
            auto object_result = Nan::New<v8::Object>();
            
            for ( size_t i = 0, s = result_.size(); i < s; ++i )
            {
                std::string planet = MakeResult( i, single_res );
                object_result->Set( Nan::New( planet ).ToLocalChecked(), single_res );
            }
            
            overall_result = object_result;
        }

        v8::Local<v8::Value> argv[] = { overall_result };
        callback->Call(1, argv);
    }
    
    std::string MakeResult( size_t i, v8::Local<v8::Object> &result )
    {
        result = Nan::New<v8::Object>();
        
        Result &input = result_[i];
        
        result->Set( Nan::New( "planet_id" ).ToLocalChecked(),
                     Nan::New( input.planet ) );
        result->Set( Nan::New( "planet" ).ToLocalChecked(),
                     Nan::New( input.planet_name ).ToLocalChecked() );
        result->Set( Nan::New( "longitude" ).ToLocalChecked(),
                     Nan::New( input.metrics.longitude ) );
        result->Set( Nan::New( "latitude" ).ToLocalChecked(),
                     Nan::New( input.metrics.latitude ) );
        result->Set( Nan::New( "distance" ).ToLocalChecked(),
                     Nan::New( input.metrics.distance ) );
        result->Set( Nan::New( "longitude_speed" ).ToLocalChecked(),
                     Nan::New( input.metrics.longitude_speed ) );
        result->Set( Nan::New( "latitude_speed" ).ToLocalChecked(),
                     Nan::New( input.metrics.latitude_speed ) );
        result->Set( Nan::New( "distance_speed" ).ToLocalChecked(),
                     Nan::New( input.metrics.distance_speed ) );
        
        return input.planet_name;
    }

    virtual void HandleErrorCallback()
    {
        Nan::HandleScope scope;

        v8::Local<v8::Value> argv[] = {
            Nan::Null(),
            Nan::New(ErrorMessage()).ToLocalChecked()
        };
        callback->Call(2, argv);
    }
};

/**
 * swe_set_ephe_path( path )
 */
void swissEphemerisPath( const Nan::FunctionCallbackInfo<v8::Value>& info )
{
    if ( info.Length() != 1 )
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }
    
    Nan::MaybeLocal<v8::String> path_arg = Nan::To<v8::String>(info[0]);
    
    if ( path_arg.IsEmpty() )
    {
        Nan::ThrowTypeError("Invalid path argument");
        return;
    }

    v8::String::Utf8Value utf8( path_arg.ToLocalChecked() );

    // NOTE: There are some obvious issues managing TLS data with abstract threads +
    // forced call drops caching.
    //::swe_set_ephe_path( *utf8 );
    
    // Env hack is below. Known issue: it can be set reliably only once
    int ret = setenv( "SE_EPHE_PATH", *utf8, 1 );
    
    if ( ret )
    {
        Nan::ThrowTypeError("Failed to set path");
    }
}

static bool getSweDate( const Nan::FunctionCallbackInfo<v8::Value>& info, double &dst )
{
    auto dt_arg = info[1].As<v8::Date>();
    
    if ( dt_arg.IsEmpty() )
    {
        Nan::ThrowTypeError("Invalid datetime argument");
        return false;
    }
    
    int year = dt_arg->Get( Nan::New("getUTCFullYear").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    int month = dt_arg->Get( Nan::New("getUTCMonth").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    int day = dt_arg->Get( Nan::New("getUTCDate").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
            
    double h = dt_arg->Get( Nan::New("getUTCHours").ToLocalChecked() ).
               As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    int m = dt_arg->Get( Nan::New("getUTCMinutes").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    int s = dt_arg->Get( Nan::New("getUTCSeconds").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    int ms = dt_arg->Get( Nan::New("getUTCMilliseconds").ToLocalChecked() ).
            As<v8::Function>()->Call( dt_arg, 0, 0 )->Int32Value();
    
    month += 1; // Oh, c'mon...
    
    h += m / 60.0;
    h += s / 3600.0;
    h += ms / 3600000.0;
            
    dst = ::swe_julday( year, month, day, h, 1 );

    
    return true;
}


/**
 * swe_calc_ut( datetime, planet )
 */
static void calcPlanet( const Nan::FunctionCallbackInfo<v8::Value>& info )
{
    if ( info.Length() != 3 )
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }
    
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());
    double dt_value;
    int32_t planet = info[2]->Int32Value();
    
    if ( !getSweDate( info, dt_value ) )
    {
        return;
    }

    AsyncCalc *aw = new AsyncCalc( callback, dt_value, planet );
    Nan::AsyncQueueWorker( aw );
    info.GetReturnValue().SetUndefined();
}

/**
 * swe_calc_ut( datetime, planet )
 */
static void calcAll( const Nan::FunctionCallbackInfo<v8::Value>& info )
{
    if ( info.Length() != 3 )
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }
    
    Nan::Callback *callback = new Nan::Callback(info[0].As<v8::Function>());
    double dt_value;
    
    if ( !getSweDate( info, dt_value ) )
    {
        return;
    }

    Nan::MaybeLocal<v8::Array> planets_arg = info[2].As<v8::Array>();
    
    if ( planets_arg.IsEmpty() )
    {
        Nan::ThrowTypeError("Invalid planets argument");
        return;
    }

    v8::Local<v8::Array> planet_array = planets_arg.ToLocalChecked();
    std::vector<int> planets;

    for ( size_t i = 0; i < planet_array->Length(); ++i )
    {
            planets.push_back(planet_array->Get(i)->Int32Value());
    }

    AsyncCalc *aw = new AsyncCalc( callback, dt_value, std::move(planets) );
    Nan::AsyncQueueWorker( aw );
    info.GetReturnValue().SetUndefined();
}


/**
 * Module initialization
 */
void Init( v8::Local<v8::Object> exports )
{
    exports->Set(Nan::New("swissEphemerisPath").ToLocalChecked(),
                 Nan::New<v8::FunctionTemplate>(swissEphemerisPath)->GetFunction());
    exports->Set(Nan::New("calcAll").ToLocalChecked(),
                 Nan::New<v8::FunctionTemplate>(calcAll)->GetFunction());
    exports->Set(Nan::New("calcPlanet").ToLocalChecked(),
                 Nan::New<v8::FunctionTemplate>(calcPlanet)->GetFunction());
}

NODE_MODULE(swiss_ephemeris, Init)
