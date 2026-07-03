const API_BASE_URL = "http://localhost:8080";

async function request(endpoint, options = {}){
    const response = await fetch(`${API_BASE_URL}${endpoint}`,{
        headers:{
            "Content-Type" : "application/json",
        },
    });
    if(!response.ok) throw new Error(`API 요청 실패 : ${response.status}`);
    return response.json();
}

async function checkServerCondition(){
    try{
        const data = await request("/api/health");
        console.log(data);
    } catch(error){
        console.log(error);
    }
}

checkServerCondition();