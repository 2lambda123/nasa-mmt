module FormHelper
  def mmt_text_field(options)
    options[:name] = add_pipes(options[:name]) unless options[:name].include?('|')

    classes = ['full-width']
    classes << 'validate' if options[:validate]
    classes << options[:classes]

    # for data center contact person/groups in data contacts form, need to keep the data center information
    # at the same data-level and data-required-level as the contact person/ group, so the required fields
    # appear/disappear with the contact person/group information
    if options[:prefix] =~ /\|contact_person_data_center\|_$/ #== 'draft_|data_contacts|_|contact_person_data_center|_'
      data_level = remove_pipes(options[:prefix] + '|contact_person|_')
      options[:required_level] += 1
    elsif options[:prefix] =~ /\|contact_group_data_center\|_$/ #== 'draft_|data_contacts|_|contact_group_data_center|_'
      data_level = remove_pipes(options[:prefix] + '|contact_group|_')
      options[:required_level] += 1
    else
      data_level = remove_pipes(options[:prefix])
    end

    text_field_html = text_field_tag(
      name_to_param(options[:prefix] + options[:name]),
      options[:value],
      class: classes.join(' '),
      data: { level: data_level,
              required_level: options[:required_level] }
    )

    mmt_label(options) + mmt_help_icon(options) + text_field_html
  end

  def mmt_text_area(options)
    options[:name] = add_pipes(options[:name])

    classes = []
    classes << 'validate' if options[:validate]
    classes << options[:classes]

    text_area_html = text_area_tag(
      name_to_param(options[:prefix] + options[:name]),
      options[:value],
      rows: 8,
      class: classes.join(' '),
      data: { level: remove_pipes(options[:prefix]) }
    )

    mmt_label(options) + mmt_help_icon(options) + text_area_html
  end

  def mmt_select(options)
    options[:name] = add_pipes(options[:name])

    classes = ["half-width #{remove_pipes(options[:name])}-select"]
    classes += options[:classes].split(' ') if options[:classes]
    classes << 'validate' if options[:validate]

    # default values when not multi-select
    is_multi_select = false
    prompt = "Select #{options[:title]}"
    size = nil

    is_multi_select = true if options[:multiple]

    select_options = options[:options].clone
    if options[:grouped]
      select_options = grouped_options_for_select(select_options, options[:value])
    else
      # restrict options for drop down if for metadata_date
      select_options.shift(2) if options[:metadata_date]

      disabled_options = []

      if is_multi_select
        prompt = nil
        size = 4
        values = options[:value] || []
        values.each do |value|
          if value && invalid_select_option(select_options, value)
            # handle invalid options for multi_select
            select_options.unshift value
            disabled_options << value
          end
        end
      else
        # prepend invalid disabled option
        if options[:value] && invalid_select_option(select_options, options[:value])
          select_options.unshift options[:value]
          disabled_options = options[:value]
        end
      end

      select_options = options_for_select(select_options, selected: options[:value], disabled: disabled_options)
    end

    if classes.include? 'select2-select'
      styles = 'width: 100%;'
      classes.delete('half-width')
    end

    # for data center contact person/groups in data contacts form, need to keep the data center information
    # at the same data-level and data-required-level as the contact person/ group, so the required fields
    # appear/disappear with the contact person/group information
    if options[:prefix] =~ /\|contact_person_data_center\|_$/ #== 'draft_|data_contacts|_|contact_person_data_center|_'
      data_level = remove_pipes(options[:prefix] + '|contact_person|_')
      options[:required_level] += 1
    elsif options[:prefix] =~ /\|contact_group_data_center\|_$/ #== 'draft_|data_contacts|_|contact_group_data_center|_'
      data_level = remove_pipes(options[:prefix] + '|contact_group|_')
      options[:required_level] += 1
    else
      data_level = remove_pipes(options[:prefix])
    end
    # need to make sure the required icons act the way we want with this change
    # labels, name, id will be different than data-level ...

    select_html = select_tag(
      name_to_param(options[:prefix] + options[:name]),
      select_options,
      multiple: is_multi_select,
      size: size,
      class: classes,
      prompt: prompt,
      data: { level: data_level,
              required_level: options[:required_level] },
      style: styles
    )

    mmt_label(options) + mmt_help_icon(options) + select_html
  end

  def mmt_datetime(options)
    options[:name] = add_pipes(options[:name])

    classes = ['full-width']
    classes << 'validate' if options[:validate]
    classes << options[:classes]

    datetime_html = datetime_field_tag(
      name_to_param(options[:prefix] + options[:name]),
      options[:value],
      class: classes.join(' '),
      placeholder: "YYYY-MM-DDTHH:MM:SSZ",
      data: { level: remove_pipes(options[:prefix]) }
    )

    mmt_label(options) + mmt_help_icon(options) + datetime_html
  end

  def mmt_number(options)
    options[:name] = add_pipes(options[:name])

    classes = []
    classes << 'validate' if options[:validate]
    classes << options[:classes]

    number_html = number_field_tag(
      name_to_param(options[:prefix] + options[:name]),
      options[:value],
      class: classes.join(' '),
      data: { level: remove_pipes(options[:prefix]) }
    )

    mmt_label(options) + mmt_help_icon(options) + number_html
  end

  def mmt_label(options)
    options[:name] = add_pipes(options[:name])
    id = remove_pipes(options[:prefix] + options[:name]) if options[:set_id]
    label_for = id.nil? ? remove_pipes(options[:prefix] + options[:name]) : nil

    classes = []
    classes << 'required' if options[:required]
    classes << 'always-required eui-required-o' if options[:always_required]
    label_tag(
      label_for,
      options[:title],
      class: classes,
      id: id
    )
  end

  def mmt_help_icon(options)
    return unless options[:help]
    link_to('#help-modal', class: 'display-modal') do
      "<i class=\"eui-icon eui-fa-info-circle\" data-help-path=\"#{options[:help]}\"></i><span class=\"is-invisible\">Help modal for #{options[:title]}</span>".html_safe
    end
  end

  def add_pipes(name)
    "|#{name}|"
  end

  def editable_metadata_dates(metadata)
    dates = metadata['MetadataDates'] || []
    editable_dates = dates.reject { |date| date['Type'] == 'CREATE' || date['Type'] == 'UPDATE' }
    editable_dates.empty? ? [{}] : editable_dates
  end

  def metadata_create_date(metadata)
    dates = metadata['MetadataDates']
    create_date = dates.find { |date| date['Type'] == 'CREATE' }
    create_date
  end

  def metadata_update_date(metadata)
    dates = metadata['MetadataDates']
    update_date = dates.find { |date| date['Type'] == 'UPDATE' }
    update_date
  end

  def hidden_metadata_date_fields(metadata)
    dates = metadata['MetadataDates']
    return unless dates && dates.any? { |date| date['Type'] == 'CREATE' }

    create_type = hidden_field_tag('draft[metadata_dates][-2][type]',
                                   metadata_create_date(metadata)['Type'])
    create_datetime = hidden_field_tag('draft[metadata_dates][-2][date]',
                                       metadata_create_date(metadata)['Date'])
    update_type = hidden_field_tag('draft[metadata_dates][-1][type]',
                                   metadata_update_date(metadata)['Type'])
    update_datetime = hidden_field_tag('draft[metadata_dates][-1][date]',
                                       metadata_update_date(metadata)['Date'])

    create_type + create_datetime + update_type + update_datetime
  end

  def invalid_select_option(options, value)
    if options[0].class == Carmen::Country
      matches = options.select { |option| option.name.include? value }
      matches.empty?
    else
      matches = options.select { |option| option.include? value }
      matches.empty?
    end
  end
end
