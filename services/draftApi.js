import {request} from '../apiClient.js';

export async function getCurrentDraft({accessToken}){
    return request("/api/draft-post/current", {
        method:"GET",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
    });
}
export async function saveDraft({accessToken, title, postBody, postImageUrl, version}){
    return request("/api/draft-post", {
        method:"POST",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            title: title,
            postBody : postBody,
            postImageUrl: postImageUrl,
            version: version,
        },
    });
}

export async function updateDraft({accessToken, title, postBody, postImageUrl, version}){
    return request("/api/draft-post", {
        method:"PATCH",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            title: title,
            postBody : postBody,
            postImageUrl: postImageUrl,
            version: version,
        },
    });
}

export async function publishDraft({accessToken, title, postBody, postImageUrl, version}){
    return request("/api/draft-post/publish", {
        method:"POST",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
        body:{
            title: title,
            postBody : postBody,
            postImageUrl: postImageUrl,
            version: version,
        },
    });
}

export async function deleteDraft({accessToken}){
    return request("/api/draft-post", {
        method:"DELETE",
        headers:{
            Authorization: `Bearer ${accessToken}`,
        },
    });
}