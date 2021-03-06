import React from 'react';
import Modal from 'react-modal';
import Moment from 'moment';
import * as _ from 'underscore';

import Header from './components/Header';
import Result from './components/Result';

import './App.css';
import './css/Modal.css';

const searchURL = 'https://api.github.com/search/users?';
const profileURL = 'https://api.github.com/users/';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.content = React.createRef();

    this.handleScroll = _.throttle(this.handleScroll.bind(this), 200);

    this.state = {
      users: [],
      selectedUser: {},
      term: '',
      results: '',

      modal: false,
      fetching: false,
      page: 2,
      endOfResults: false
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  /**
   * Calculates how far along the page the user has scrolled,
   * if it's within 300px of bottom, fetch next page of results.
   * 
   * @param {Object} event Event generated by the scroll listener
   */

  handleScroll(event) {
    const y = window.scrollY;
    const h = window.innerHeight;
    const c = this.content.current.offsetHeight;

    if(y >= c - h - 300)
    {
      if(!this.state.fetching && !this.state.endOfResults)
      {
        this.fetchNextPage();
      }
    }
  }

  /**
   * Fetches the next page of search results and adds them to the end of current results array.
   */
  fetchNextPage() {
    this.setState({fetching: true});
    const query = searchURL + 'q=' + encodeURIComponent(`${this.state.term} in:name in:email`) + `&per_page=20&page=${this.state.page}`;
    
    fetch(query)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if(data.message)
      {
        alert("An error occured");
      }
      else if(data.items.length < 20)
      {
        this.setState({fetching: false, endOfResults: true, users: [...this.state.users, ...data.items]});
      }
      else
      {
        this.setState({fetching: false, users: [...this.state.users, ...data.items], page: this.state.page + 1});
      }
    });
  }

  /**
   * Searches using Github API to find users matching the search term in their username or public email.
   * 
   * @param {String} term Term to be searched against by API
   */
  search(term) {
    this.setState({term, endOfResults: false});
    const query = searchURL + 'q=' + encodeURIComponent(`${term} in:name in:email`) + '&per_page=20&page=1';

    fetch(query)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if(data.message)
      {
        alert("An error occured");
      }
      else if(data.items)
      {
        this.setState({users: data.items, results: data.total_count});
      }
    });
  }

  /**
   * Fetches the full profile of the user clicked on from the results list.
   * 
   * @param {String} username Which user to get more info about
   */
  getMoreInfo(username) {
    const url = `${profileURL}${username}`;
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.setState({selectedUser: data, modal: true});
    });
  }

  /**
   * Closes modal and resets selected user.
   */
  closeModal() {
    this.setState({modal: false, selectedUser: {}});  
  }

  render() {
    const { avatar_url, html_url, name, login, location, email, public_repos, created_at, updated_at, bio, blog } = this.state.selectedUser;

    return (
      <div className="App" ref={this.content}>
        <Modal
          isOpen={this.state.modal}
          contentLabel={login}
          className="modal"
          overlayClassName="overlay"
        >
          <button className="closeModal" onClick={() => this.closeModal()}>X</button>
          <img className="modalImg" src={avatar_url} alt={name}/>
          <a className="modalName" href={html_url} target="__blank">{name} <span>{login}</span></a>
          <p className="modalP modalLoc">{location || "no location given"}</p>
          <div className="divider"></div>
          <p className="modalP">{email || "no email available"}</p>
          <a className="modalP" href={`https://www.github.com/${login}?tab=repositories`} target="__blank">{public_repos} public repos</a>
          <p className="modalP">Joined: {Moment(created_at).format('MMM DD, YYYY')}<br/>Last updated: {Moment(updated_at).format('MMM DD, YYYY')}</p>
          <p className="modalP modalBio">{bio}</p>
          <a className="modalButton profile" href={html_url} target="__blank">Profile</a>
          <a className="modalButton repos" href={`https://www.github.com/${login}?tab=repositories`} target="__blank">Repositories</a>
          {blog &&
            <a className="modalButton blog" href={blog} target="__blank">Blog/Website/Portfolio</a>
          }
        </Modal>
        <Header
          onSearch={(t) => this.search(t)}
          results={this.state.results}
        />
        <div className="resultsContainer">
          {this.state.users.map((u, i) =>
            <button key={`r${i}`} className="resultButton" onClick={() => this.getMoreInfo(u.login)}>
              <Result
                image={u.avatar_url}
                username={u.login}
              />
            </button>
          )}
          {this.state.endOfResults &&
            <p className="end">End of results</p>
          }
        </div>
      </div>
    );
  }
}

export default App;
