import {request} from '../apiClient.js';

export async function getCommentList({accessToken, postId}){
    return request(`/api/posts/${postId}/comments`, {
        method:"GET",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function postComment({accessToken, postId, commentBody}){
    return request(`/api/posts/${postId}/comments`, {
        method:"POST",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            commentBody: commentBody,
        }
    });
}

export async function modifyComment({accessToken, postId, commentId, commentBody}){
    return request(`/api/posts/${postId}/comments/${commentId}`, {
        method:"PATCH",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            commentBody: commentBody,
        }
    });
}

export async function deleteComment({accessToken, postId, commentId}){
    return request(`/api/posts/${postId}/comments/${commentId}`, {
        method:"DELETE",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
    });
}