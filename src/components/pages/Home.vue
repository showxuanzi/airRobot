<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加banner</el-button>
            </div>
            <el-table :data="tableData" border class="table">
                <el-table-column label="图片" align="right">
                    <template slot-scope="scope">
                        <img class="banner" :src="scope.row.imgpath">
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="order" label="顺序" width="100" align="center"></el-table-column> -->
                <!-- <el-table-column prop="date" label="上传时间" width="200" align="center"></el-table-column> -->
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <!-- <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button> -->
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="30%" v-loading="loading" 
            element-loading-text="图片上传中，请稍等"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.6)">
            <el-form ref="form" :model="form" label-width="50px" >
                <el-form-item label="banner" class="uploadBox">
                    <img :src="cropImg" v-show="cropImg" class="pre-img">
                    <div class="crop-demo-btn">选择图片
                        <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage"/>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import Qs from 'qs';
    export default {
        name: 'home',
        data: function(){
            return {
                dialogTitle: "添加",
                tableData: [],
                editVisible: false,
                delVisible: false,
                form: {
                    imgpath: '',
                },
                
                cropImg:"",
                deleteImgId: "",
                loading: false
            }
        },
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post(globalServerUrl+"/common/bannerList.do"
                ).then((res) => {
                    this.tableData = res.data;
                })
            },
            // 保存编辑
            saveEdit() {
                // this.$set(this.tableData, this.idx, this.form);
                // this.editVisible = false;
                // this.$message.success(`修改成功`);
                this.$axios.post(globalServerUrl+"/common/addbanner.do",Qs.stringify({
                    imgpath: this.cropImg
                })).then((res) => {
                    if(res.data == 1){
                        this.editVisible = false;
                        this.$message.success(`添加成功`);
                        this.getData();
                    }else if(res.data == 2){
                        this.$message.error(`添加失败`);
                    }
                })
            },
            // 编辑按钮
            handleEdit(index, row) {
                const item = this.tableData[index];
                this.form = {
                    url: item.url,
                    order: item.order,
                    date: item.date
                }
                this.editVisible = true;
                this.dialogTitle = "编辑";
            },
            // 添加按钮
            handleAdd(){
                this.cropImg = "";
                this.editVisible = true;
                this.dialogTitle = "添加";
            },
            // 删除按钮
            handleDelete(id) {
                console.log(id);
                this.deleteImgId = id;
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/common/delete.do",Qs.stringify({
                    id: this.deleteImgId
                })).then((res) => {
                    console.log(res)
                    if(res.data == 1){
                        this.$message.success('删除成功');
                        this.getData();
                    }else{
                        this.$message.error('删除失败');
                    }
                    this.delVisible = false;
                })
                
                
            },
            // 上传图片
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
                    console.log(res);
                    this.cropImg = globalServerUrl + res.data;
                    this.loading = false;
                })
            }
        },
        created(){
            this.getData();
        }
    }
</script>
<style>
    
</style>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .blue{
        color: #409EFF;
    }
    .pre-img{   
        width: auto;
        height: 100px;
        background: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 5px;
    }
    .crop-demo{
        /*display: flex;
        align-items: flex-end;*/
    }
    .uploadBox{
        position: relative;
    }
    .crop-demo-btn{
        display: inline-block;
        width: 90px;
        height: 30px;
        line-height: 30px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #fa820c;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        margin-top: -20px;
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
    .cell img.banner{
         height: 150px;
        width: auto;
    }
</style>