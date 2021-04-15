# cfinch

Generate command line arguments for running chromium with finch configurations.

## Common examples

### Configuring features & params:

```
cfinch \
  -f myFeature1 myFeature2 \
  -p myParam1 paramValue1 myParam2 paramValue2
```

Will generate

```
out/Default/chrome\
  --force-fieldtrials=OmniboxBundledExperimentV1/Default\
  --enable-features='myFeature1<OmniboxBundledExperimentV1,myFeature2<OmniboxBundledExperimentV1'\
  --force-fieldtrial-params=OmniboxBundledExperimentV1.Default:myParam1/paramValue1/myParam2/paramValue2
```

### Configuring study & group:

```
cfinch -c stable -s myStudy -g myGroup
```

Will generate

```
out/Default/chrome\
  --fake-variations-channel=stable\
  --variations-server-url=http://localhost:8080/seed\
  --force-fieldtrials=myStudy/myGroup
```

## chromium params supported

1. `fake-variations-channel`
1. `variations-server-url`
1. `force-fieldtrials`
1. `enable-features`
1. `force-fieldtrial`
1. `force-variation-ids`
1. `google-base-url`

## Usage 

1. clone this repo & run `npm i`

1. Add an alias `cfinch` to `<path>/chromeFinch/src/chromeFinch.js "$@"`

1. Run `cfinch help` to print:

```
> cfinch help
Arguments:
    -o out/Default                                              out|o         single string       overrides the default build dir "out/Default"                                                 
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

## Output formatting

To make reading output easier, it will be slightly modified according to these rules:

- Replace file paths with idea IDE compatible paths.
- Color & style output; see supported styles below
  - E.g. `println('underline red x blue y bold z\n');` will print `underline red x blue y bold z` styled accordingly.
- Prefix lines with line numbers
- Print a new line when output is delayed more than 1.5s; this helps group up long outputs.
- Hide outputs matching `/^(\/usr\/local\/google\/home\/\w+\/|~)workspace\/goma\/gomacc .*$/`.

### Examples

#### Before

![screenshot without transformation](./screenshots/build-untransformed.png)

#### After

![screenshot with transformation](./screenshots/build-transformed.png)

#### Before

![screenshot without transformation 3](./screenshots/run-untransformed-3.png)

#### After

![screenshot with transformation 3](./screenshots/run-transformed-3.png)

#### Before

![screenshot without transformation 3](./screenshots/untrasnformed-5.png)

#### After

![screenshot with transformation 3](./screenshots/transformed-5.png)

#### Supported styles

Misc

- normal
- bold
- underline

Colors

- black
- red
- green
- yellow
- blue
- pink
- cyan
- white
- orange
- gray

Inverted colors

- iblack
- ired
- igreen
- iyellow
- iblue
- ipink
- icyan
- iwhite
- iorange
- igray

Inverted light colors

- ilblack
- ilred
- ilgreen
- ilyellow
- ilblue
- ilpink
- ilcyan
- ilwhite
