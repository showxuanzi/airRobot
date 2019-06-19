<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加专家</el-button>
            </div>
            <el-table :data="tableData" border class="table" id="out-table">
                <el-table-column label="照片" align="center">
                    <template slot-scope="scope">
                        <img class="banner" :src="scope.row.imgpath">
                    </template>
                </el-table-column>
                <el-table-column prop="xingming" label="姓名" align="center"></el-table-column>
                <el-table-column prop="zhiwei" label="职位" align="center"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row.id)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="blue" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalNumber"></el-pagination>
            </div>
        </div>
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
        name: 'export',
        data: function(){
            return {
                tableData: [],
                oldtableData: [],
                delVisible: false,
                limit: '10',
                exportId: "",
                totalNumber:1,
                cur_page: 1
            }
        },
        updated() {
        },
        methods:{
            // 初始化表格数据
            getData(page,limit) {
                this.$axios.post(globalServerUrl+"/zhuanjia/zhuanjialist.do", Qs.stringify({
                    page: page,
                    limit: limit
                })).then((res) => {
                    // 如果当前页面没有数据，则重新请求上一页的内容
                     if(res.data.data.length == 0 && this.cur_page > 1){
                        this.cur_page = this.cur_page - 1;
                        this.getData(this.cur_page,this.limit);
                        return 
                    }else{
                        this.tableData = res.data.data;
                        this.totalNumber = res.data.count;
                    }
                })
            },
            // 编辑按钮
            handleEdit(id) {
                this.$router.push({
                    path: '/exportDetail',
                    query: {
                        id: id
                    }
                })
            },
            // 添加按钮
            handleAdd(){
                this.$router.push("/addExport");
            },
            // 删除按钮
            handleDelete(id) {
                this.delVisible = true;
                this.exportId = id;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/zhuanjia/deletezj.do", Qs.stringify({
                    id: this.exportId
                })).then((res) => {
                    if(res.data == 1){
                        this.$message.success('删除成功');
                        this.delVisible = false;
                        this.getData(this.cur_page,this.limit);
                    }
                })
                
            },
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData(this.cur_page,this.limit);
            }
        },
        created(){
            this.cropImg = this.defaultSrc;
            this.getData(this.cur_page,this.limit);
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
        height: 50px;
        width: auto;
    }
</style>