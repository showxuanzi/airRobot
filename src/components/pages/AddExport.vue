<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-magic-stick"></i> 风采展示</el-breadcrumb-item>
                <el-breadcrumb-item>专家</el-breadcrumb-item>
                <el-breadcrumb-item>添加专家</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container"  v-loading="loading" 
                element-loading-text="图片上传中，请稍等"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.6)">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="news-form">
                <el-form-item label="姓名" prop="xingming">
                    <el-input v-model="form.xingming"></el-input>
                </el-form-item>
                <el-form-item label="职位" prop="zhiwei">
                    <el-input v-model="form.zhiwei"></el-input>
                </el-form-item>   
                 <el-form-item label="简介" prop="jianjie">
                    <el-input type="textarea" :rows="5" v-model="form.jianjie"></el-input>
                </el-form-item>    
                <el-form-item label="照片" prop="imgpath">
                    <div class="crop-demo">
                        <img :src="cropImg" class="pre-img" v-show="cropImg">
                        <div class="crop-demo-btn">选择图片
                            <input class="crop-input" type="file" name="file" accept="image/*" @change="setImage"/>
                        </div>
                    </div>
                </el-form-item>
                <!-- 图片上传组件辅助-->
                <el-upload v-show="false"
                        class="avatar-uploader"
                        :action="serverUrl"
                        name="file"
                        accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP,.mp4"
                        :show-file-list="false"
                        :on-success="uploadSuccess"
                        :on-error="uploadError"
                        :before-upload="beforeUpload"
                        >
                </el-upload>
                <!-- 图片上传组件辅助-->
                 <el-form-item label="主要成就" prop="chengjiu">
                    <quill-editor 
                        ref="myTextEditor" 
                        v-model="chengjiu" 
                        :options="editorOption"
                        @change="onEditorChange($event)"
                        @ready="onEditorReady($event)"
                    ></quill-editor>
                </el-form-item>
                <el-button class="editor-btn" type="primary" @click="submit('form')">确认添加</el-button>
            </el-form> 
        </div>
    </div>
</template>

<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import Qs from 'qs';
    // 工具栏配置
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{'header': 1}, {'header': 2}],               // custom button values
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
      [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
      [{'direction': 'rtl'}],                         // text direction

      [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
      [{'header': [1, 2, 3, 4, 5, 6, false]}],

      [{'color': []}, {'background': []}],          // dropdown with defaults from theme
      [{'font': []}],
      [{'align': []}],
      ['link', 'image', 'video'],
      ['clean']                                         // remove formatting button
    ]
    export default {
        name: 'addexport',
        data: function(){
            return {
                form:{
                    xingming:"",
                    zhiwei: "",
                    imgpath: "",
                    jianjie: "",
                    chengjiu: ""
                },
                loading: false,
                rules: {
                    xingming: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    zhiwei: [
                        { required: true, message: '请输入职位', trigger: 'blur' }
                    ],
                    jianjie: [
                        { required: true, message: '请输入简介', trigger: 'blur' }
                    ]
                },
                defaultSrc: './static/img/img.jpg',
                cropImg: '',
                quillUpdateImg: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
                serverUrl: '',  // 上传的图片服务器地址
                chengjiu: '',
                editorOption: {
                    placeholder: 'Hello World',
                    theme: 'snow',  // or 'bubble'
                    modules: {
                        toolbar: {
                            container: toolbarOptions,  // 工具栏
                            handlers: {
                                'image': function (value) {
                                    if (value) {
                                        // 触发input框选择图片文件
                                        document.querySelector('.avatar-uploader input').click();
                                    } else {
                                        this.quill.format('image', false);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        components: {
            quillEditor
        },
        created(){
            this.serverUrl = globalServerUrl + "/activity/fileupload.do";
        },
        methods: {
            onEditorChange({ editor, html, text }) {
                this.chengjiu = html;
            },
            onEditorReady(event){

            },
            submit(formName){
                this.form.chengjiu = this.chengjiu;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$axios.post(globalServerUrl+"/zhuanjia/insertzj.do",Qs.stringify(this.form)
                        ).then((res)=>{
                            if(res.data == 1){
                                this.$message.success('添加成功！');
                                this.$router.push("/export");
                            }
                        })
                    } else {
                        this.$message.error('添加失败，请重试！');
                        return false;
                    }
                });
                
                
            },
           // 富文本图片上传前
            beforeUpload(file) {
                // 显示loading动画
                this.loading = true;
                const isJPG = file.type === 'image/jpeg';
                const isLt1M = file.size / 1024 / 1024 < 1;
                // if (!isJPG) {
                //   this.$message.error('上传头像图片只能是 JPG 格式!');
                // }
                if (!isLt1M) {
                    this.$message.error('上传图片大小不能超过 1MB!');
                    this.loading = false;
                }
                return isLt1M;
            },
            uploadSuccess(res, file) {
                // res为图片服务器返回的数据
                // 获取富文本组件实例
                let quill = this.$refs.myTextEditor.quill;
                // 如果上传成功
                if(res){
                    // 获取光标所在位置
                    let length = quill.getSelection().index;
                     // 插入图片  res为服务器返回的图片地址
                    quill.insertEmbed(length, 'image', globalServerUrl+res);
                    // 调整光标到最后
                    quill.setSelection(length + 1);
                }else{
                    this.$message.error('图片插入失败');
                }
                // loading动画消失
                this.loading = false;
            },
            // 富文本图片上传失败
            uploadError() {
                // loading动画消失
                this.loading = false;
                this.$message.error('图片插入失败')
            },
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
                    this.cropImg = globalServerUrl + res.data;
                    this.form.imgpath = globalServerUrl + res.data;
                    console.log(this.form.imgpath )
                })
            },
        }
    }
</script>
<style scoped>
    .editor-btn.el-button--primary{
        margin-top: 20px;
        display: block;
        margin: 0 auto;
    }
    .el-input.el-input--small{
        width: 400px;
    }
    .el-textarea.el-input--small{
        width: 400px;
    }
    .content-title{
        font-weight: 400;
        line-height: 50px;
        margin: 10px 0;
        font-size: 22px;
        color: #1f2f3d;
    }
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
<style>
    .el-upload-list--picture-card .el-upload-list__item{
        width: 200px;
    }
    .el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-thumbnail{
        width: 100%;
        height: auto;
    }
</style>