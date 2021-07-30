import React from 'react';

import './../css/Result.css';

class User extends React.Component {
  render() {
    return(
      <div className="userContainer">
        <img className="userImg" src={this.props.image}/>
        <div className="userInfoView">
          <h2 className="userName">{this.props.username}</h2>
        </div>
      </div>
    )
  }
}

export default User;