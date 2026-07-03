import {request} from '../apiClient.js';

export async function postUpload({accessToken, title, postBody, postImageUrl = null}){
    return request("/api/posts", {
        method:"POST",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            title, postBody, postImageUrl,
        }
    });
}

export async function getPostList({accessToken}){
    return request("/api/posts",{
        method:"GET",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        }
    });
}

export async function getPostDetail({accessToken, postId}){
    return request(`/api/posts/${postId}`,{
        method:"GET",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        }
    });
}

export async function modifyPost({accessToken, postId, title, postBody, postImageUrl}){
    return request(`/api/posts/${postId}`,{
        method:"PATCH",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            title:title,
            postBody: postBody,
            postImageUrl: postImageUrl,
        }
    });
}

export async function deletePost({accessToken, postId}){
    return request(`/api/posts/${postId}`,{
        method:"DELETE",
        headers:{
            Authorization:`Bearer ${accessToken}`,
        },
    });
}

export async function likePost({accessToken, postId}){
    return request(`/api/posts/${postId}/likes`,{
        method:"POST",
        headers:{
            Authorization:`Bearer ${accessToken}`,
        },
    });
}

export async function unlikePost({accessToken, postId}){
    return request(`/api/posts/${postId}/likes`,{
        method:"DELETE",
        headers:{
            Authorization:`Bearer ${accessToken}`,
        },
    });
}

export async function reportPost({accessToken, postId, reason, description}){
    return request(`/api/posts/${postId}/report`,{
        method:"POST",
        headers:{
            Authorization:`Bearer ${accessToken}`,
        },
        body:{
            reason:reason,
            description:description,
        },
    });
}