import { createContext, useState } from "react";

export const CommentContext = createContext({
  posts: [],
  renderPosts: () => {},
  renderComments: () => {},
  renderResponse1: () => {},
  renderResponse2: () => {},
  addComment: () => {},
  removeComment: () => {},
  addResponse1: () => {},
  removeResponse1: () => {},
  addResponse2: () => {},
  removeResponse2: () => {},
});

function CommentContextProvider({ children }) {
  const [posts, setPosts] = useState([]);
  function renderPosts(givenPosts) {
    setPosts((post) => {
       return [...post, ...givenPosts];
    });
  }

  function renderComments(postId, comments) {
    setPosts((post) => {
      const ready = [...post];
      ready[post.findIndex((pos) => pos.id === postId)].comments = comments;
      return ready;
    });
  }

  const value = {
    posts: posts,
    renderPosts: renderPosts,
    renderComments: renderComments,
    renderResponse1: () => {},
    renderResponse2: () => {},
    addComment: () => {},
    removeComment: () => {},
    addResponse1: () => {},
    removeResponse1: () => {},
    addResponse2: () => {},
    removeResponse2: () => {},
  };

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
}

export default CommentContextProvider;
