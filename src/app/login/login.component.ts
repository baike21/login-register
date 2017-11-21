import {Component, Directive, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {User} from '../_models/user';
import {AlertService, AuthenticationService} from '../_services/index';
import {isUndefined} from "util";


@Component({
  selector: 'app-login-container',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  user = new User();

  public loading = false;  // 正在去服务器申请登陆中的状态
  public submitted = false;  // 用户已经按下登陆键时为真
  public validemail = true;  // email格式检查

  public usernamefocus = true;  // 光标是否聚焦
  public usernameblur = false;
  public passwdfocus = false;
  public passwdblur = false;

  returnUrl: string;  // 成功登陆后返回的URL
  currentStyles: {};  // 当前输入框的样式

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  // username控件的样式设置
  setCurrentStyles() {
    this.currentStyles = {
      'box-shadow': this.usernamefocus ? '0 0 10px #4169E1' : this.invalidUsername() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentStyles;
  }

  ngOnInit() {
    this.setCurrentStyles();
    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // blur时进行邮箱格式校验
  checkEmail(raw_email: string) {
    this.usernamefocus = false;  // 光标移走后开验证
    this.usernameblur = true;  // 光标移走了
    // console.log('输入的邮箱是' + raw_email);
    const emailRegex = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/;
    if (emailRegex.test(raw_email)) {
      this.validemail = true;  // 格式正确
      this.setCurrentStyles();
    } else {
      this.validemail = false;
      this.setCurrentStyles();
    }
    // console.log('当前状态email格式判断' + this.validemail);
  }

  // 查看状态，判读是否显示 气泡 邮箱格式有误
  invalidEmailFormat() {
    // console.log('当前值' + this.user.username);
    if ( !( isUndefined(this.user.username) || this.user.username === '' ) && !this.validemail && this.usernameblur && !(/\s+/.test(this.user.username))) {
      return true;  // 不为空且格式不对且失去焦点且不是无效字符时  气泡显示
    } else {
      return false;  // 为空或者格式正确或者获得焦点时气泡消失
    }
  }

  // 光标聚焦到username输入框的事件
  usernameFocus() {
    this.usernamefocus = true;
    this.usernameblur = false;
    this.passwdfocus = false;
    this.submitted = false;
    this.setCurrentStyles();
  }

  // 光标聚焦到password输入框的事件
  passwdFocus() {
    this.passwdfocus = true;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.submitted = false;
    this.setCurrentStyles();
  }

  // 查看状态,决定提交后是否显示空用户名的气泡,并更新当前输入框样式
  invalidSubmitUsername() {
    if (this.submitted && !this.usernamefocus) {
      if (isUndefined(this.user.username) || this.user.username === '' || /\s+/.test(this.user.username)) {
        return true;  // 不合法的用户名输入,显示错误提示给用户
      } else {
        return false;
      }
    } else {
      return false;  //  用户没点提交键，不显示
    }
  }

  // 查看状态，不合法的用户名返回真（包括邮箱格式不正确，空格缩进换行分页等无效字符）
  invalidUsername() {
    if (this.invalidEmailFormat() || this.invalidSubmitUsername()) {
      return true;
    } else {
      return false;
    }
  }


  //
  //


  // 登陆键被点击
  submit(user) {
    this.submitted = true;
    this.passwdfocus = false;
    this.passwdblur = true;
    this.usernamefocus = false;
    this.usernameblur = true;

    if (!this.invalidUsername()) {
      this.loading = true;
      this.authenticationService.login(this.user.username, this.user.password)
        .subscribe(
          data => {
            this.router.navigate([this.returnUrl]);
          },
          error => {
            this.alertService.error(error);
            this.loading = false;
          });
    } else {
      return false;
    }
  }

}


