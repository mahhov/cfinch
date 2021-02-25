# cfinch

## Description

Generate command line arguments for running chromium with finch configurations.

## Example

```
cfinch \
  -g x \
  -f OmniboxMaxZeroSuggestMatches \
     OmniboxOnFocusSuggestions \
   -p $(encode "ZeroSuggestVariant:*:*") $(encode "RemoteNoUrl,Local") \
      MaxZeroSuggestMatches 3
```

Will generate

```
out/Default/chrome\
  --fake-variations-channel=stable\
  --variations-server-url=http://localhost:8080/seed\
  --force-fieldtrials=OmniboxBundledExperimentV1/x\
  --enable-features='OmniboxMaxZeroSuggestMatches<OmniboxBundledExperimentV1,OmniboxOnFocusSuggestions<OmniboxBundledExperimentV1'\
  --force-fieldtrial-params=OmniboxBundledExperimentV1.x:ZeroSuggestVariant%3A*%3A*/RemoteNoUrl%2CLocal/MaxZeroSuggestMatches/3
```

## Params supported

1. `fake-variations-channel`

1. `variations-server-url`

1. `force-fieldtrials`

1. `enable-features`

1. `force-fieldtrial`

1. `force-variation-ids`

1. `google-base-url`

## Usage 

1. clone this repo & run `npm i`

1. Add an alias `cfinch` to `yourPath/chromeFinch/chromeFinch.js "$@"`

1. Run `cfinch help` to print:

```
> cfinch help
Arguments:
    -o out/Default                                              out|o         single string       overrides the default build dir out/Default.                                                  
    -b                                                          build|b       no values           rebuilds.                                                                                     
    -c beta                                                     channel|c     single string       sets fake-variations-channel=beta and variations-server-url=http://localhost:8080/seed        
    -d                                                          dogfood|d     no values           sets variations-server-url=http://localhost:8080/seed?restrict=dogfood                        
    -s OmniboxBundledExperimentV1                               study|s       single string       overrides the default study "OmniboxBundledExperimentV1" used below                           
    -g Dev_Desktop_OmniboxDocumentMinCharacters_Control_V2      group|g       single string       sets force-fieldtrials=study/group                                                            
    -f OmniboxLocalEntitySuggestions ...                        feature|f     multiple strings    sets enable-features="OmniboxLocalEntitySuggestions,...<study                                 
    -p UIMaxAutocompleteMatches 8 OmniboxMaxURLMatches 4 ...    param|p       multiple strings    sets force-fieldtrial-params=study.group:UIMaxAutocompleteMatches/8/OmniboxMaxURLMatches/4/...
    -gi t3315884 3314219 ...                                    gwsid|gi      multiple strings    sets force-variation-ids="t3315884,3314219,..."                                               
    -gbu https://manukh-4.demos.corp.google.com/                google|gbu    single string       sets google-base-url=https://manukh-4.demos.corp.google.com/                    
```
