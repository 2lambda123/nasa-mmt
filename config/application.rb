require File.expand_path('../boot', __FILE__)

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "sprockets/railtie"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Mmt
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    config.active_record.raise_in_transactional_callbacks = true

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += Dir["#{config.root}/lib", "#{config.root}/lib/**/"]
    config.eager_load_paths += Dir["#{config.root}/lib", "#{config.root}/lib/**/"]

    # This was added when MMT added custom error routes and pages
    config.exceptions_app = self.routes

    config.services = YAML.load_file(Rails.root.join('config/services.yml'))

    config.umm_c_version = 'vnd.nasa.cmr.umm+json; version=1.9'
    config.umm_var_version = 'vnd.nasa.cmr.umm+json; version=1.1'
    config.umm_s_version = 'vnd.nasa.cmr.umm+json; version=1.1'

    def load_version
      version_file = "#{config.root}/version.txt"
      if File.exist?(version_file)
        return IO.read(version_file)
      elsif File.exist?('.git/config') && `which git`.size > 0
        version = `git rev-parse --short HEAD`
        return version
      end
      '(unknown)'
    end

    config.version = load_version

    # Log request UUID so we can track requests across threaded log messages
    config.log_tags = [:uuid]
  end
end
