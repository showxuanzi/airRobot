<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">翰本空气质量监测平台</div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input placeholder="用户名" v-model="ruleForm.username">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')">
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                 <el-form-item prop="mobile">
                    <el-input placeholder="手机号" v-model="ruleForm.mobile">
                        <el-button slot="prepend" icon="el-icon-mobile-phone"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">注册</el-button>
                </div>
                <p class="login-tips"><router-link to="/login">已有账号，去登陆</router-link></p>
            </el-form>
        </div>
        <el-button type="text" @click="dialogVisible = true">点击打开 Dialog</el-button>
        <el-dialog
          :visible.sync="dialogVisible"
          width="20%" >
          <p><i class="el-icon-loading"></i><span>注册成功，正在跳转，请稍等</span></p>
          <p><span>若没有跳转，请</span><router-link to="/login">点我登陆</router-link></p>
          <!-- <span slot="footer" class="dialog-footer"> -->
            <!-- <el-button @click="dialogVisible = false">取 消</el-button> -->
            <!-- <el-button type="primary" @click="dialogVisible = false">确 定</el-button> -->
            <!-- <el-button type="primary" @click="login">确 定</el-button> -->
          <!-- </span> -->
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data: function(){
            var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
            var validaPhone = (rule, value, callback) =>{
                if(value === ""){
                    return callback(new Error("请输入手机号"));
                };
                setTimeout(() => {
                    if (!phoneReg.test(value)) {
                      callback(new Error('格式有误'))
                    } else {
                      callback()
                    }
                }, 1000);
            };
            return {
                ruleForm: {
                    username: '',
                    password: '',
                    mobile: ''
                },
                rules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, validator: validaPhone, trigger: 'blur' }
                    ]
                },
                dialogVisible: false,
                formName: ""
            }
        },
        methods: {
            submitForm(formName) {
                
                this.$refs[formName].validate((valid) => {
                    var _this = this;
                    if(valid){
                        this.$axios.get("http://192.168.1.102:8080/user/regist.do", {
                            params:{
                                "username": this.ruleForm.username,
                                "password": this.ruleForm.password,
                                "mobile": this.ruleForm.mobile
                            }
                        }).then((res) => {
                            if(res.data === 1){
                                this.$refs[formName].resetFields();
                                this.$message.error('该用户名已存在，请重新输入');
                            }else if(res.data === 2){
                                this.$refs[formName].resetFields();
                                this.dialogVisible = true;
                                setTimeout(function(){
                                    this.dialogVisible = false;
                                    _this.$router.push({path: '/login'}); 
                                },2000)
                            }
                        });
                    };
                });
            },
            login(){
                this.dialogVisible = false;
                this.$router.push("/login");
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
    .el-dialog__body>p{
        line-height: 30px;
        text-align: center;
    }
    .el-dialog__body>p>span{
        margin-left: 20px;
    }
    .el-dialog__body>p>.el-icon-loading{
        font-size: 20px;
        color: #409EFF;
    }
    .el-dialog__body>p>a{
        color:#409EFF;
        text-decoration: underline;
    }
</style>