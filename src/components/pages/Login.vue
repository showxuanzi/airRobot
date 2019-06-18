<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">无人机在线后台管理</div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="用户名">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')">
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                 <!-- <el-form-item prop="username">
                    <el-input placeholder="手机号">
                        <el-button slot="prepend" icon="el-icon-mobile-phone"></el-button>
                    </el-input>
                </el-form-item> -->
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>

                </div>
                <!-- <p class="login-tips"><router-link to="/registered">没有账号，去注册</router-link></p> -->
                <!-- <p class="login-tips" @click="test">没有账号，去注册</p> -->

            </el-form>
        </div>
    </div>
</template>

<script> 
    import Qs from 'qs';
    export default {
        data: function(){
            return {
                ruleForm: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [{ 
                        required: true, //是否必填
                        message: '请输入用户名', //规则
                        trigger: 'blur' //触发事件
                    }],
                    password: [{ 
                        required: true, 
                        message: '请输入密码',
                         trigger: 'blur' 
                    }]
                }
            }
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$axios.post(globalServerUrl+"/user/adminlogin.do",Qs.stringify({
                            username: this.ruleForm.username,
                            password: this.ruleForm.password
                        })).then((res) => {
                            if(res.data ==1){
                                sessionStorage.setItem('hb_username',this.ruleForm.username);
                                this.$router.push({path:'/'}); 
                            }else{
                                this.$refs[formName].resetFields();
                                this.$message.error('用户名或密码错误，请重新输入');
                            }
                        });
                        
                    } else {
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap{
        position: relative;
        width:100%;
        height:100%;
        background-image: url(../../assets/login.jpg);
        background-size: cover;
        background-attachment: fixed;
    }
    .ms-title{
        width:100%;
        line-height: 50px;
        text-align: center;
        font-size:20px;
        color: #fff;
        border-bottom: 1px solid #ddd;
    }
    .ms-login{
        position: absolute;
        left:68%;
        top:50%;
        width:350px;
        margin:-190px 0 0 -175px;
        border-radius: 5px;
        background: rgba(0,0,0, 0.3);
        overflow: hidden;
    }
    .ms-content{
        padding: 30px 30px;
    }
    .login-btn{
        text-align: center;
    }
    .login-btn button{
        width:100%;
        height:36px;
        margin-bottom: 10px;
    }
    .login-tips{
        font-size:12px;
        line-height:30px;
        text-align: right;
    }
    .login-tips a{
        color:#fff;
        text-decoration: underline;
    }
</style>