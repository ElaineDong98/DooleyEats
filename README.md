# Dooley Eats using Node.js & Passport Login

This is a user login and registration app using Node.js, Express, Passport, Mongoose, EJS and some other packages.

### Version: 2.0.0

### Usage

```sh
$ npm install
```

```sh
$ npm start
# Or run with Nodemon
$ npm run dev

# Visit http://localhost:5000
```

### MongoDB

Open "config/keys.js" and add your MongoDB URI, local or Atlas


## Demonstration

### User Register and login

After entered our website, users are required to **register** an account using Emory Email. 
![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.47.11%20PM.png)

The Registration will send a **veridication email** to your email and give out a token. You have to use that token to complete the registration. 

You can also **reset** the password. The reset link will also send to your email, and there will be a link to reset it. 

After all these have done, you can **login** now!
![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.47.19%20PM.png)


### Main Dashboard

#### 1. header

We have links to our profile, create post, and search bar in our header. 

#### 2. content bar

We have three types of posts: 
 * Restaurant Review 
 * Recipe
 * Hang Out 



#### 3. Main Contents


We divide the main body into three parts: 
 * Hang Out
 * Trending Posts
 * Newest Posts
 
The last two parts are for the combination of *Restaurant Review* and *Recipe*.
 
**Hang Out**

In the Hang Out section, users can post various activity notifications. These are sorted by Date as a Default. 

![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.48.06%20PM.png)

For instance, club members can post sales information, users can post discount and free food information. 

**Trending Posts**

We also have our trending posts. 
The sorting of trending post considers: the number of liked, viewed, and commented. It only shows post within that month. 

Each individual post has several links: to tags, to more info, and to author. 
The numbers of *liked* and *viewed* are calculated

![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.48.22%20PM.png)


**Newest Posts**

We also have our newest posts, sorted by the Date. 



#### 4. Footer


![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.49.56%20PM.png)


### View All Posts

#### 1. Default

Default contents are all three types of posts sorted by Date. 

![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.48.22%37PM.png)

The header enables user to go to their own profile and sign out

![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.49.15%20PM.png)


#### 2. Sorting 

There is a sorting button here: 


![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.50.18%20PM.png)


#### 3. Searching 

We can search posts by their title, tags, and types. 


![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.49.49%20PM.png)


### Create New Posts


![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.50.46%20PM.png)


### User Profile

User profile is consist of the following components: 

* edit profile

     Users can only change their own profile. 
     
* Add friend

     User can add others as friends. There will be a link to his/her Facebook page. 
     
* Statistics
     
     The total number of posts and likes received. 
     
* Demographics 

     Since this is for emory students, we have many related fields like Major and Year. 
     
* Users' Posts

* Users' Liked Posts



    
![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.52.11%20PM.png)

### Post Page

#### Content
![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.57.08%20PM.png)

#### Comment area

Under the post details, we also have a comment area. 

You can choose to add *Anonymous* comments and also normal ones. The link to comment author's profile is working. 

You can only delete/edit your comment. 

![](https://github.com/ElaineDong98/DooleyEats/blob/master/demonstrating%20graphs/Screen%20Shot%202019-12-03%20at%2011.57.40%20PM.png)
