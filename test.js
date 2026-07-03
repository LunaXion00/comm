import {signup, login, logout, modifyInfo, modifyPassword, withdrawn} from './services/userApi.js';


var accessToken = "access-token1";

async function signuptest(){
    try{
        const result = await signup({
            email : "test1@test.com", 
            password: "12341234",
            passwordConfirm : "12341234",
            nickname : "test1",
            profileImageUrl : "asdf.com"
        });
        console.log(`${result.message} : ${result.data.createdAt}`);
    } catch(error){
        console.log(error);
    }
}

async function logintest(){
    try{
        const result = await login({
            email : "test1@test.com", 
            password: "12341234"
        });
        accessToken = result.data.accessToken;
        console.log(`${result.message} : ${result.data.accessToken}`);
    } catch(error){
        console.log(error);
    }
}

async function logouttest(){
    try{
        const result = await logout(accessToken);

        console.log(result.message);
    } catch(error){
        console.log(error);
    }
}

async function modifyInfoTest(){
    try{
        const result = await modifyInfo({
            userId: 1, 
            accessToken: accessToken, 
            nickname: "hello", 
            profileImageUrl: "change.link",
        });
        console.log(result.message);
    } catch(error){
        console.log(error);
    }
}

async function modifyPasswordTest(){
    try{
        const result = await modifyPassword({
            userId: 1,
            accessToken : accessToken,
            password: "asdfasdf",
            passwordConfirm: "asdfasdf"
        });
    }catch (error){
        console.log(error);
    }
}

async function withdrawnTest(){
    try{
        const result = await withdrawn({
            userId:1,
            accessToken: accessToken,
        });
        console.log(`${result.message} : ${result.data.withDrawnAt}`)
    } catch(error){
        console.log(error);
    }
}
// logintest();
// logouttest();

// modifyInfoTest();
// modifyPasswordTest();

withdrawnTest();