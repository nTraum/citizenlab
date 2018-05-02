// Libraries
import React from 'react';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { IStreamParams, IStream } from 'utils/streams';

// Services
import { FoundUser as GroupsFoundUser } from 'services/groups';
import { FoundUser as ModeratorsFoundUser } from 'services/moderators';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

import localize, { injectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import ReactSelect from 'react-select';
import Avatar from 'components/Avatar';

// Style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const AddUserButton = styled(Button)`
  padding-left: 0;
`;

const AddUserRow = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${color('separation')};
  border-top: 1px solid ${color('separation')};
`;

const StyledSelect = styled(ReactSelect)`
  max-width: 300px;
`;

const StyledOption = styled.div`
  color: black;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;

  &.disabled {
    color: ${color('mediumGrey')};

    .email {
      color: inherit;
    }
  }
`;

const StyledAvatar = styled(Avatar)`
  flex: 0;
  height: 1rem;
  margin-right: 1rem;
`;

const OptionName = styled.div`
  flex: 1;
  margin: 0;
  overflow: hidden;

  p {
    margin: 0;
  }

  .email {
    color: ${color('label')};
  }
`;

const OptionIcon = styled(Icon)`
  flex: 0 0 1rem;
  height: 1rem;
  fill: ${color('clBlue')};
  margin-left: 1rem;
`;

// Typing
import { IOption, Message } from 'typings';

type FoundResponse = {
  data: GroupsFoundUser[] | ModeratorsFoundUser[];
};

interface Props {
  resourceId: string;
  messages: {addUser: Message};
  searchFunction: (resourceId: string, streamParams: IStreamParams) => IStream<FoundResponse>;
  addFunction: (resourceId: string, userId: string) => Promise<{}>;
}

interface State {
  selectVisible: boolean;
  selection: (IOption & {email: string})[];
  loading: boolean;
  value: string;
}

function isGroupUser(user: GroupsFoundUser | ModeratorsFoundUser): user is GroupsFoundUser {
  return (user as GroupsFoundUser).attributes.is_member !== undefined;
}


class MembersAdd extends React.Component<Props & injectedLocalized, State> {
  subscriptions: Subscription[];
  input$: Subject<string>;

  constructor(props: Props) {
    super(props as any);

    this.state = {
      selectVisible: false,
      selection: [],
      loading: false,
      value: '',
    };

    this.subscriptions = [];
    this.input$ = new Subject<string>();
  }

  componentDidMount() {
    this.subscriptions.push(
      this.input$
      .debounceTime(300)
      .switchMap(inputValue => {
        this.setState({ loading: true });
        return this.props.searchFunction(this.props.resourceId, {
          queryParameters: {
            search: inputValue
          }
        }).observable;
      })
      .subscribe((usersResponse) => {
        const options = this.getOptions(usersResponse.data);
        this.setState({ selection: options, loading: false });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  toggleSelectVisible = () => {
    this.setState({ selectVisible: !this.state.selectVisible });
  }

  handleSearchChange = (inputValue) => {
    this.setState({ value: inputValue });
    // Broadcast change in the the stream for request handling
    this.input$.next(inputValue);
    // Return new value for the component
    return inputValue;
  }

  handleSelection = (selection: IOption) => {
    if (selection && selection.value) {
      this.props.addFunction(this.props.resourceId, selection.value);
    }
  }

  getOptions = (users: any[]) => {
    return users.map((user: GroupsFoundUser | ModeratorsFoundUser) => {
      return {
        value: user.id,
        label: `${user.attributes.first_name} ${user.attributes.last_name}`,
        email: `${user.attributes.email}`,
        disabled: isGroupUser(user) ? user.attributes.is_member : user.attributes.is_moderator,
      };
    });
  }

  renderOption = (option) => {
    return (
      <StyledOption className={option.disabled ? 'disabled' : ''}>
        <StyledAvatar size="small" userId={option.value} />
        <OptionName>
          <p>{option.label}</p>
          <p className="email">{option.email}</p>
        </OptionName>
        {!option.disabled &&
          <OptionIcon name="plus-circle" />
        }
      </StyledOption>
    );
  }

  render() {
    return (
      <AddUserRow>
        {!this.state.selectVisible &&
          <AddUserButton onClick={this.toggleSelectVisible} icon="plus-circle" style="text">
            <FormattedMessage {...this.props.messages.addUser} />
          </AddUserButton>
        }
        {this.state.selectVisible &&
          <div>
            <StyledSelect
              autofocus={true}
              name="search-user"
              value={this.state.value}
              isLoading={this.state.loading}
              options={this.state.selection}
              onInputChange={this.handleSearchChange}
              onChange={this.handleSelection}
              optionRenderer={this.renderOption}
            />
          </div>
        }
      </AddUserRow>
    );
  }
}

export default localize<Props>(MembersAdd);
