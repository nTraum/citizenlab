# frozen_string_literal: true

require 'citizen_lab'

require 'factory_bot_rails'
require 'rack/attack'
require 'rspec_api_documentation'
require 'rspec-parameterized'
require 'simplecov'
require 'simplecov-rcov'
require 'webmock/rspec'

WebMock.allow_net_connect!

SimpleCov.formatters = [
  SimpleCov::Formatter::HTMLFormatter,
  SimpleCov::Formatter::RcovFormatter
]
SimpleCov.start 'rails'

# This file was generated by the `rails generate rspec:install` command. Conventionally, all
# specs live under a `spec` directory, which RSpec adds to the `$LOAD_PATH`.
# The generated `.rspec` file contains `--require spec_helper` which will cause
# this file to always be loaded, without a need to explicitly require it in any
# files.
#
# Given that it is always loaded, you are encouraged to keep this file as
# light-weight as possible. Requiring heavyweight dependencies from this file
# will add to the boot time of your test suite on EVERY test run, even for an
# individual file that may not need all of that loaded. Instead, consider making
# a separate helper file that requires the additional dependencies and performs
# the additional setup, and require it from the spec files that actually need
# it.
#
# The `.rspec` file also contains a few flags that are not defaults but that
# users commonly want.
#
# See http://rubydoc.info/gems/rspec-core/RSpec/Core/Configuration
RSpec.configure do |config|
  # rspec-expectations config goes here. You can use an alternate
  # assertion/expectation library such as wrong or the stdlib/minitest
  # assertions if you prefer.
  config.expect_with :rspec do |expectations|
    # This option will default to `true` in RSpec 4. It makes the `description`
    # and `failure_message` of custom matchers include text for helper methods
    # defined using `chain`, e.g.:
    #     be_bigger_than(2).and_smaller_than(4).description
    #     # => "be bigger than 2 and smaller than 4"
    # ...rather than:
    #     # => "be bigger than 2"
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  # rspec-mocks config goes here. You can use an alternate test double
  # library (such as bogus or mocha) by changing the `mock_with` option here.
  config.mock_with :rspec do |mocks|
    # Prevents you from mocking or stubbing a method that does not exist on
    # a real object. This is generally recommended, and will default to
    # `true` in RSpec 4.
    mocks.verify_partial_doubles = true
  end

  # This option will default to `:apply_to_host_groups` in RSpec 4 (and will
  # have no way to turn it off -- the option exists only for backwards
  # compatibility in RSpec 3). It causes shared context metadata to be
  # inherited by the metadata hash of host groups and examples, rather than
  # triggering implicit auto-inclusion in groups with matching metadata.
  config.shared_context_metadata_behavior = :apply_to_host_groups

# The settings below are suggested to provide a good initial experience
# with RSpec, but feel free to customize to your heart's content.
=begin
  # This allows you to limit a spec run to individual examples or groups
  # you care about by tagging them with `:focus` metadata. When nothing
  # is tagged with `:focus`, all examples get run. RSpec also provides
  # aliases for `it`, `describe`, and `context` that include `:focus`
  # metadata: `fit`, `fdescribe` and `fcontext`, respectively.
  config.filter_run_when_matching :focus

  # Allows RSpec to persist some state between runs in order to support
  # the `--only-failures` and `--next-failure` CLI options. We recommend
  # you configure your source control system to ignore this file.
  config.example_status_persistence_file_path = "spec/examples.txt"

  # Limits the available syntax to the non-monkey patched syntax that is
  # recommended. For more details, see:
  #   - http://rspec.info/blog/2012/06/rspecs-new-expectation-syntax/
  #   - http://www.teaisaweso.me/blog/2013/05/27/rspecs-new-message-expectation-syntax/
  #   - http://rspec.info/blog/2014/05/notable-changes-in-rspec-3/#zero-monkey-patching-mode
  config.disable_monkey_patching!

  # Many RSpec users commonly either run the entire suite or an individual
  # file, and it's useful to allow more verbose output when running an
  # individual spec file.
  if config.files_to_run.one?
    # Use the documentation formatter for detailed output,
    # unless a formatter has already been configured
    # (e.g. via a command-line flag).
    config.default_formatter = 'doc'
  end

  # Print the 10 slowest examples and example groups at the
  # end of the spec run, to help surface which specs are running
  # particularly slow.
  config.profile_examples = 10

  # Run specs in random order to surface order dependencies. If you find an
  # order dependency and want to debug it, you can fix the order by providing
  # the seed, which is printed after each run.
  #     --seed 1234
  config.order = :random

  # Seed global randomization in this process using the `--seed` CLI option.
  # Setting this allows you to use `--seed` to deterministically reproduce
  # test failures related to randomization by passing the same `--seed` value
  # as the one that triggered the failure.
  Kernel.srand config.seed
=end

  not_truncated_tables = %w[spatial_ref_sys]

  # from https://github.com/influitive/apartment/wiki/Testing-Your-Application
  config.before(:suite) do
    require './engines/free/email_campaigns/spec/factories/campaigns.rb'
    require './engines/free/email_campaigns/spec/factories/campaigns_groups.rb'
    require './engines/free/email_campaigns/spec/factories/deliveries.rb'
    require './engines/free/email_campaigns/spec/factories/consents.rb'
    require './engines/free/email_campaigns/spec/factories/unsubscription_tokens.rb'
    require './engines/free/surveys/spec/factories/responses.rb'
    require './engines/free/polls/spec/factories/questions.rb'
    require './engines/free/polls/spec/factories/options.rb'
    require './engines/free/polls/spec/factories/responses.rb'
    require './engines/free/polls/spec/factories/response_options.rb'
    require './engines/free/volunteering/spec/factories/causes.rb'
    require './engines/free/volunteering/spec/factories/volunteers.rb'

    # Clean all tables to start
    DatabaseCleaner.clean_with :truncation, { except: not_truncated_tables }

    # Truncating doesn't drop schemas, ensure we're clean here, app *may not* exist
    Apartment::Tenant.drop('example_org') rescue nil

    # Create the default tenant for our tests
    if CitizenLab.ee?
      FactoryBot.create(:test_tenant)
      not_truncated_tables << 'tenants'
    else
      FactoryBot.create(:test_app_configuration)
      not_truncated_tables << 'app_configurations'
    end
  end

  config.before(:suite) do
    I18n.load_path += Dir[Rails.root.join('spec/fixtures/locales/*.yml')]
    Rack::Attack.enabled = false
  end

  config.around(:all) do |examples|
    initial_sentry_dsn = ENV['SENTRY_DSN']
    ENV['SENTRY_DSN'] = nil # to not send errors in test env, but do send in development (if set)
    #
    # We need it for the tests where Sentry is not invoked explicitly. E.g. for ApplicationJob tests.
    # Reasons to initialize Sentry:
    # 1. Trigger `Sentry::Rails.capture_exception` for testing.
    # 2. Avoid complicated stubs of private Sentry methods.
    #
    # Why not to use this code in those tests that need it?
    # => Because `Sentry.init` affects all tests, not only the current one.
    Sentry.init
    examples.run
    ENV['SENTRY_DSN'] = initial_sentry_dsn
  end

  config.before(:all) do
    Apartment::Tenant.switch!('example_org') if CitizenLab.ee? # Switch into the default tenant
  end

  config.before(:each) do
    Apartment::Tenant.switch!('example_org') if CitizenLab.ee? # Switch into the default tenant
  end

  config.around(:each, use_transactional_fixtures: false) do |example|
    initial_use_transactional_tests = use_transactional_tests

    self.use_transactional_tests = false

    example.run
    DatabaseCleaner.clean_with :truncation, { except: not_truncated_tables }

    self.use_transactional_tests = initial_use_transactional_tests
  end

  config.around(:each, active_job_inline_adapter: true) do |example|
    initial_queue_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :inline
    example.run
    ActiveJob::Base.queue_adapter = initial_queue_adapter
  end

  # By default, skip the slow tests and template tests. Can be overriden on the command line.
  config.filter_run_excluding slow_test: true
  config.filter_run_excluding template_test: true
end

RspecApiDocumentation.configure do |config|
  config.format = ENV["DOC_FORMAT"] || :html
  config.docs_dir = Pathname.new(ENV["DOCS_DIR"]) if ENV["DOCS_DIR"]
  config.api_name = ENV["API_NAME"] || "API documentation"
  config.request_body_formatter = :json
end
