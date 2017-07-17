require 'rails_helper'

describe VariableDraftsController, reset_provider: true do
  describe 'GET #index' do
    before do
      sign_in

      get :index, draft_type: 'VariableDraft'
    end

    it 'renders the #index view' do
      expect(response).to render_template(:index)
    end

    it 'sets the variable_drafts instance variable' do
      expect(assigns(:variable_drafts)).to eq([])
    end
  end

  describe 'GET #new' do
    before do
      sign_in

      get :new, draft_type: 'VariableDraft'
    end

    it 'renders the #new view' do
      expect(response).to render_template(:new)
    end

    it 'sets the variable_draft instance variable' do
      expect(assigns(:variable_draft)).to be_a_new(VariableDraft)
    end
  end

  describe 'POST #create' do
    context 'with valid attributes' do
      before do
        sign_in
      end

      it 'redirects to the variable draft edit page' do
        post :create, variable_draft: { draft: {} }, draft_type: 'VariableDraft'

        expect(response).to redirect_to(edit_variable_draft_path(VariableDraft.last))
      end

      it 'creates a new variable draft' do
        expect{
          post :create, variable_draft: { draft: {} }, draft_type: 'VariableDraft'
        }.to change(VariableDraft, :count).by(1)
      end
    end
  end
end
