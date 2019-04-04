#!/bin/bash
gcloud beta functions deploy clean-up-artifacts \
    --region=europe-west1 \
    --source=./clean-up-artifacts \
    --runtime=nodejs8 \
    --entry-point=cleanBuildArtifacts \
    --trigger-bucket=extraterm_builds \
    --stage-bucket=extraterm_functions \
    --service-account=extraterm-builds@extraterm.iam.gserviceaccount.com
