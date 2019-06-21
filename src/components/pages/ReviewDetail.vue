<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-video-camera"></i> 赛事回顾</el-breadcrumb-item>
                <el-breadcrumb-item>编辑视频</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container"  v-loading="loading" 
                element-loading-text="上传中，请稍等"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
                <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="news-form">
                <el-form-item label="视频标题" prop="title">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="创建时间" prop="createTime">
                     <el-date-picker
                        v-model="form.createTime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime"
                        placeholder="选择创建时间"
                        default-time="12:00:00">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="视频简介" prop="content">
                    <el-input type="textarea" :row="3" v-model="form.content"></el-input>
                </el-form-item>    
                <el-form-item label="封面图片" prop="imgpath">
                    <div class="crop-demo">
                        <img :src="form.imgpath" class="pre-img" v-show="form.imgpath">
                        <div class="crop-demo-btn">选择图片
                            <input class="crop-input" type="file" name="file" accept="image/*" @change="setImage"/>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="上传视频" prop="videopath">
                    <el-upload class="avatar-uploader el-upload--text"
                        :action="serverUrl" 
                        :show-file-list="false"
                        accept=".mp4"  
                        :on-success="handleVideoSuccess"  
                        :before-upload="beforeUploadVideo" >  
                        <video v-if="this.form.videopath !='' && !videoFlag"  
                            :src="this.form.videopath"  
                            class="avatar video-avatar"
                            controls="controls">您的浏览器不支持视频播放
                        </video> 
                        <i v-else-if="this.form.videopath =='' && !videoFlag"
                            class="el-icon-plus avatar-uploader-icon">
                        </i> 
                        <el-button class="video-btn"
                            slot="trigger"
                            size="small"
                            v-if="isShowUploadVideo"
                            type="primary">选取文件
                        </el-button>
                    </el-upload>
                    <P v-if="isShowUploadVideo" class="text">请保证视频格式正确，且不超过20M</P>
                </el-form-item>
                <el-button class="editor-btn" type="primary" @click="submit('form')">保存修改</el-button>
            </el-form> 
        </div>
    </div>
</template>

<script>
    import Qs from 'qs';
    export default {
        name: 'addreview',
        data: function(){
            return {
                loading: false,
                serverUrl:"",//你要上传视频到你后台的地址
                videoFlag:false , //是否显示进度条
                isShowUploadVideo: false, //显示上传按钮 
                form:{
                    title: "",
                    imgpath: "",
                    videopath: "",
                    content: "",
                    createTime: "",
                    lookcount: "",
                    dianzancount: ""
                },
                 rules: {
                    title: [
                        { required: true, message: '请输入视频标题', trigger: 'blur' }
                    ],
                    createTime: [
                        { required: true, message: '请选择创建时间', trigger: 'blur' }
                    ],
                    videopath: [
                        { required: true, message: '请上传视频', trigger: 'change' }
                    ],
                    imgpath: [
                        { required: true, message: '请上传封面图片', trigger: 'change' }
                    ],
                    content: [
                        { required: true, message: '请输入视频简介', trigger: 'blur' }
                    ]
                },
                reviewId: 0     
            }
        },
        created(){
            this.reviewId = this.$route.query.id;
            this.serverUrl = globalServerUrl + "/activity/fileupload.do";
            this.getData();
        },
        methods: {
            // 显示所有数据
            getData(){
                this.$axios.post(globalServerUrl+"/comreview/toedit.do",Qs.stringify({
                    id: this.reviewId
                })).then((res)=>{
                    console.log(res);
                    this.form = res.data;
                    
                })
            },
            //上传前回调
            beforeUploadVideo (file) {
                const isLt20M = file.size / 1024 / 1024 < 20;
                if (['video/mp4'].indexOf(file.type) == -1) { //'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'
                    this.$message.error('请上传正确的视频格式');
                    return false;
                }
                if (!isLt20M) {
                    this.$message.error('上传视频大小不能超过20MB哦!');
                    return false;
                }
                this.isShowUploadVideo = false;
                this.loading = true;
            },
            //上传成功回调
            handleVideoSuccess (res, file) {
                this.videoFlag = false;
                if (file.status == "success") {
                    this.loading = false;
                    this.form.videopath = globalServerUrl + res;
                } else {
                    this.isShowUploadVideo = true;
                    this.$message.error('视频上传失败，请重新上传！');
                }
            },
            // 上传视频封面
            setImage(e){
                this.loading = true;
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                let formData = new FormData();
                formData.append("file",file);
                this.$axios.post(globalServerUrl+"/activity/fileupload.do",
                    formData,
                ).then((res)=>{
                    this.loading = false;
                    this.form.imgpath = globalServerUrl + res.data;
                })
            },
            // 修改视频
            submit(formName){
                this.$set(this.form,"createuserid",1);
                this.$refs[formName].validate((valid) => {
                    console.log(valid)
                    if (valid) {
                        this.$axios.post(globalServerUrl+"/comreview/editsave.do",Qs.stringify(this.form)
                        ).then((res)=>{
                            if(res.data == 1){
                                this.$message.success('修改成功！');
                                this.$router.push("/review");
                            }else{
                                this.$message.error('修改失败，请重试！');
                            }
                        })
                    } else {
                        return false;
                    }
                });
                
                
            }
            
        }
    }
</script>
<style scoped>
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #409eff;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
    .video-avatar {
        width: 400px;
        height: 200px;
    }
    .el-input.el-input--small,.el-date-editor.el-input,.el-textarea.el-input--small{
        width: 400px;
    }
    /* 上传图片、视频 */
    .pre-img{   
        width: auto;
        height: 100px;
        background: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 5px;
    }
    .crop-demo{
        display: flex;
        align-items: flex-end;
    }
    .crop-demo-btn{
        position: relative;
        width: 100px;
        height: 30px;
        line-height: 30px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #fa820c;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
        box-sizing: border-box;
        bottom: 50%;
    }
    .crop-input{
        position: absolute;
        width: 100px;
        height: 40px;
        left: 0;
        top: 0;
        opacity: 0;
        cursor: pointer;
    }
</style>
