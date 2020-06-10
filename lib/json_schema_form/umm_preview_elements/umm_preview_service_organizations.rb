# Renders cards for Service Organizations

# :nodoc:
class UmmPreviewServiceOrganizations < UmmPreviewOrganizations
# TODO: MMT-2267 Abstract these and tool preview elements to minimize repeated
# code

  def render_card_body(service_organization)
    capture do
      concat(content_tag(:div, class: 'card-body active') do
        concat(content_tag(:div, class: 'card-body-details-full') do
          concat content_tag(:h6, service_organization['LongName']) if service_organization['LongName']
        end)
      end)

      concat render_online_resource(service_organization['OnlineResource'])

      concat render_card_navigation(service_organization['OnlineResource'])
    end
  end

  def render_online_resource(online_resource)
    capture do
      if online_resource
        concat(content_tag(:div, class: 'card-body') do
          concat(content_tag(:div, class: 'card-body-details') do
            concat content_tag(:p, online_resource['Name']) if online_resource['Name']
            concat content_tag(:p, online_resource['Description']) if online_resource['Description']

            concat(if online_resource['Linkage']
                     link_to online_resource['Linkage'], online_resource['Linkage'], title: online_resource.fetch('Name', 'Online Resource Linkage')
                   else
                     'Not provided'
                   end)
          end)

          concat(content_tag(:div, class: 'card-body-aside') do
            concat content_tag(:p, "Protocol: #{online_resource['Protocol']}")
            concat content_tag(:p, "Application Profile: #{online_resource['ApplicationProfile']}")
            concat content_tag(:p, "Function: #{online_resource['Function']}")
          end)
        end)
      end
    end
  end

  def render_card_navigation(online_resource)
    capture do
      if online_resource
        content_tag(:div, class: 'card-navigation') do
          concat(content_tag(:ul) do
            concat(content_tag(:li, class: 'card-navigation-control') do
              concat content_tag(:a, content_tag(:i, nil, class: 'fa fa-chevron-left'), href: '', class: 'card-navigation-control-back')
            end)

            concat(content_tag(:li, class: 'card-navigation-pagination') do
              concat content_tag(:i, nil, class: 'fa fa-circle')
              # Have to put whitespace in to space out the navigation circles
              # Surely there is a better solution to this
              concat ' '
              concat content_tag(:i, nil, class: 'fa fa-circle-o')
            end)

            concat(content_tag(:li, class: 'card-navigation-control') do
              concat content_tag(:a, content_tag(:i, nil, class: 'fa fa-chevron-right'), href: '', class: 'card-navigation-control-forward')
            end)
          end)
        end
      end
    end
  end
end
