run "production_keeps_catalog_domain" {
  command = plan

  variables {
    catalog_path = "testdata/mfes.json"
    environment  = "production"
  }

  assert {
    condition     = output.mfes["todo"].domain == "todo.mfe.nammamedmate.com"
    error_message = "Production domain must stay the catalog production domain."
  }
}

run "staging_derives_environment_domain" {
  command = plan

  variables {
    catalog_path = "testdata/mfes.json"
    environment  = "staging"
  }

  assert {
    condition     = output.mfes["todo"].domain == "todo.staging.mfe.nammamedmate.com"
    error_message = "Staging domain must be derived from the staging suffix."
  }
}
