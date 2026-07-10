import {request} from '../apiClient.js';

export async function signup({email, password, passwordConfirm, nickname, profileImageUrl = null}){
    return request("/api/users/signup", {
        method:"POST",
        body:{
            email, password, passwordConfirm, nickname, profileImageUrl
        }
    });
}

export async function login({email, password}){
    return request("/api/users/login",{
        method:"POST",
        body:{
            email, password
        }
    });
}

export async function logout(){
    return request("/api/users/logout",{
        method:"POST",
    });
}

// PATCH {userId}/info, header에 token, body에 nickname, profileImageUrl
export async function modifyInfo({userId, nickname, profileImageUrl}){
    return request(`/api/users/${userId}/info`, {
        method:"PATCH",
        body:{
            nickname, profileImageUrl
        },
    });
}

// PATCH {userId}/password, header에 token, body에 password, passwordConfirm
export async function modifyPassword({userId, password, passwordConfirm}){
    return request(`/api/users/${userId}/password`, {
        method:"PATCH",
        body:{
            password, passwordConfirm
        },
    });
}

//DELETE {userId}, header에 token
export async function withdrawn({userId}){
    return request(`/api/users/${userId}`,{
        method:"DELETE",
    });
}