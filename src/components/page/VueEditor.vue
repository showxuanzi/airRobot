<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 表单</el-breadcrumb-item>
                <el-breadcrumb-item>编辑器</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="plugins-tips">
                Vue-Quill-Editor：基于Quill、适用于Vue2的富文本编辑器。
                访问地址：<a href="https://github.com/surmon-china/vue-quill-editor" target="_blank">vue-quill-editor</a>
            </div>
            <!-- 图片上传组件辅助-->
            <el-upload v-show="false"
                    class="avatar-uploader"
                    :action="serverUrl"
                    name="file"
                    :show-file-list="false"
                    :on-success="uploadSuccess"
                    :on-error="uploadError"
                    :before-upload="beforeUpload"
                    >
            </el-upload>
            <quill-editor 
                ref="myTextEditor" 
                v-model="content" 
                :options="editorOption"
                @change="onEditorChange($event)"
                @ready="onEditorReady($event)"
            ></quill-editor>
            <el-button class="editor-btn" type="primary" @click="submit">提交</el-button>
            <!-- <form action="http://192.168.1.108:8080/activity/test1.do" method="post" >
                <input type="file" name="file">
                <button type="submit">提交</button>
            </form> -->
        </div>
    </div>
</template>

<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
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
        name: 'editor',
        data: function(){
            return {
                quillUpdateImg: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
                serverUrl: 'http://192.168.1.108:8080/activity/test1.do',  // 这里写你要上传的图片服务器地址
                content: '',
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
            
        },
        methods: {
            onEditorChange({ editor, html, text }) {
                this.content = html;
            },
            onEditorReady(event){

            },
            submit(){
                console.log(this.content);
                this.$message.success('提交成功！');
            },
           // 富文本图片上传前
            beforeUpload() {
                // 显示loading动画
                this.quillUpdateImg = true;
            },
            
            uploadSuccess(res, file) {
                console.log(res)
                // res为图片服务器返回的数据
                // 获取富文本组件实例
                let quill = this.$refs.myTextEditor.quill;
                // 如果上传成功
                if(res){
                    // 获取光标所在位置
                    let length = quill.getSelection().index;
                     // 插入图片  res为服务器返回的图片地址
                    quill.insertEmbed(length, 'image', "http://192.168.1.108:8080"+res);
                    // 调整光标到最后
                    quill.setSelection(length + 1);
                }else{
                    this.$message.error('图片插入失败');
                }
                // loading动画消失
                this.quillUpdateImg = false
            },
       
            // 富文本图片上传失败
            uploadError() {
                // loading动画消失
                this.quillUpdateImg = false
                this.$message.error('图片插入失败')
            }
        }
    }
</script>
<style scoped>
    .editor-btn{
        margin-top: 20px;
    }
</style>