
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: false,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});
function alertmsg(msg='login successfully',icon='success'){
if(icon== ''){
  icon='success'
}
Toast.fire({
  icon: icon,
  title: msg
})
}



<% var msg  %>
<% var icon %>


  <% if(msg){ %>
  alertmsg('<%= msg %>', '<%= icon %>')
  <% } %> 
</script>
