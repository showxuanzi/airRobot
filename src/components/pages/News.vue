<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加新闻</el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable">
                <el-table-column prop="date" label="图片" align="center">
                    <template slot-scope="scope">
                        <img class="banner" :src="scope.row.image">
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="新闻标题" align="center"></el-table-column>
                <el-table-column prop="sort" label="新闻分类" align="center" width="200"></el-table-column>
                <el-table-column prop="date" label="上传时间" width="200" align="center"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row.id)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="1000"></el-pagination>
            </div>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="50px">
                <el-form-item label="banner" class="uploadBox">
                    <img :src="form.url" class="pre-img">
                    <div class="crop-demo-btn">选择图片
                        <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage"/>
                    </div>
                </el-form-item>
                <el-form-item label="顺序">
                    <el-input v-model="form.order"></el-input>
                </el-form-item>
                <el-form-item label="日期">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.date" value-format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
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
    import VueCropper  from 'vue-cropperjs';
    export default {
        name: 'home',
        data: function(){
            return {
                dialogTitle: "添加",
                tableData: [],
                editVisible: false,
                delVisible: false,
                form: {
                    url: '',
                    order: '',
                    date: ''
                },
            }
        },
        components: {
            VueCropper
        },
        methods:{
            // 初始化表格数据
            getData() {
                this.$axios.post("https://www.easy-mock.com/mock/5c2d7a9e410de05f5d0de700/xmx/news", {
                    page: 1
                }).then((res) => {
                    console.log(res.data);
                    this.tableData = res.data.list;
                })
            },
            // 保存编辑
            saveEdit() {
                this.$set(this.tableData, this.idx, this.form);
                this.editVisible = false;
                this.$message.success(`修改成功`);
            },
            // 编辑按钮
            handleEdit(id) {
                console.log(id);
                this.$router.push({
                    path: '/newsDetail',
                    query: {
                        id: id
                    }
                })
            },
            // 添加按钮
            handleAdd(){
                this.editVisible = true;
                this.dialogTitle = "添加";
                // this.$nextTick(() => {
                //   this.$refs['form'].resetFields();
                // });
                this.form = {
                    url: '',
                    order: '',
                    date: ''
                };
            },
            // 删除按钮
            handleDelete(id) {
                this.delVisible = true;
            },
            // 确定删除
            deleteRow(){
                this.$message.success('删除成功');
                this.delVisible = false;
            },
            // 上传图片
            setImage(e){
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.form.url = event.target.result;
                    this.$refs.cropper && this.$refs.cropper.replace(event.target.result);
                };
                reader.readAsDataURL(file);
            },
            handleCurrentChange(val) {
                // this.cur_page = val;
                this.getData();
            }
        },
        created(){
            this.cropImg = this.defaultSrc;
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
        width: 100px;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #fa820c;
        color: #fff;
        font-size: 14px;
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
        width: 200px;
    }
</style>