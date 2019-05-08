<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="handleAdd()">添加新闻</el-button>
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="exportOut()">导出</el-button>
            </div>
            <el-table :data="tableData" border class="table" id="out-table">
                <el-table-column label="封面图片" align="center">
                    <template slot-scope="scope">
                        <img class="banner" :src="scope.row.imgpath">
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="新闻标题" align="center"></el-table-column>
                <el-table-column prop="type" label="新闻分类" align="center" width="200"></el-table-column>
                <el-table-column prop="createtime" label="上传时间" width="200" align="center"></el-table-column>
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
    import FileSaver from 'file-saver';
    import XLSX from 'xlsx';
    export default {
        name: 'news',
        data: function(){
            return {
                tableData: [],
                oldtableData: [],
                delVisible: false,
                ableExportOut: false,
                limit: '10',
                form: {
                    title: '',
                    type: '',
                    createtime: ''
                },
                newsId: "",
                totalNumber:1,
                cur_page: 1
            }
        },
        updated() {
            console.log(123);
        },
        methods:{
            // 
            // exportExcel () {
            //     /* generate workbook object from table */
            //     var xlsxParam = { raw: true } // 导出的内容只做解析，不进行格式转换
            //     var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
            //     /* get binary string as output */
            //     var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
            //     try {
            //         FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'sheetjs.xlsx')
            //     } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
            //     return wbout
            // },
            // async activeExportOut(){
            //     this.ableExportOut = true //设置可以下载
            //     this.oldtableData = this.tableData //保存起就数据
            //     await this.setData()
            //     this.exportOut()
            // },
            // setData(){
            //     this.tableData = test; //赋值新数据       
            // },
            exportOut(){
                this.limit = 100;
                this.cur_page = 1;
                this.getData(this.cur_page,this.limit);
                this.$nextTick(function () {
                    var obj = document.querySelector('#out-table')
                    console.log(obj)
                    let wb = XLSX.utils.table_to_book(obj);
                    /* get binary string as output */
                    let wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'});
                    try {
                        FileSaver.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '表格名字.xlsx')
                    } catch (e) {
                        if (typeof console !== 'undefined') console.log(e, wbout)
                    }
                    console.log("inner");
                    this.getData(1,10);
                    return wbout
                })
                //
                console.log(111);
                // var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
                // var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
                // try {
                //     FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'sheetjs.xlsx')
                // } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
                
                // this.ableExportOut = false //设置不可下载
                // this.tableData = this.oldtableData //回复原来说的数据
                // return wbout
            },
            // 初始化表格数据
            getData(page,limit) {
                this.$axios.post(globalServerUrl+"/news/newsList.do", Qs.stringify({
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
                        console.log("done");
                    }
                })
            },
            // 编辑按钮
            handleEdit(id) {
                this.$router.push({
                    path: '/newsDetail',
                    query: {
                        id: id
                    }
                })
            },
            // 添加按钮
            handleAdd(){
                this.$router.push("/addNews");
            },
            // 删除按钮
            handleDelete(id) {
                this.delVisible = true;
                this.newsId = id;
            },
            // 确定删除
            deleteRow(){
                this.$axios.post(globalServerUrl+"/news/deletenews.do", Qs.stringify({
                    id: this.newsId
                })).then((res) => {
                    if(res.data == 1){
                        this.$message.success('删除成功');
                        this.delVisible = false;
                        this.getData(this.cur_page,this.limit);
                    }
                })
                
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
        height: 50px;
        width: auto;
    }
</style>