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

  public loading: boolean;  // 正在去服务器申请登陆中的状态
  public submitted: boolean;  // 用户已经按下登陆键时为真
  public validemail: boolean;  // email格式检查结果

  public usernamefocus: boolean;  // 光标是否聚焦
  public usernameblur: boolean;
  public passwdfocus: boolean;
  public passwdblur: boolean;

  returnUrl: string;  // 成功登陆后返回的URL
  currentStyles: {};  // 当前username输入框的样式
  currentPasswordStyles: {};  // 当前password输入框的样式ß

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  // username控件的样式设置
  setCurrentStyles() {
    this.currentStyles = {
      'box-shadow': this.usernamefocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidUsername() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentStyles;
  }

  // password控件的样式设置
  setCurrentPasswordStyles() {
    this.currentPasswordStyles = {
      'box-shadow': this.passwdfocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidPassword() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentPasswordStyles;
  }

  // 初始化执行函数
  ngOnInit() {
    this.loading = false;
    this.submitted = false;
    this.validemail = true;
    this.usernamefocus = true;
    this.usernameblur = false;
    this.passwdfocus = false;
    this.passwdblur = true;
    this.setCurrentStyles();
    this.setCurrentPasswordStyles();
    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // 光标聚焦到username输入框的事件
  usernameFocus() {
    this.usernamefocus = true;
    this.usernameblur = false;
    this.passwdfocus = false;
    this.passwdblur = true;
    this.submitted = false;
    // this.setCurrentStyles();
  }

  // 光标聚焦到password输入框的事件
  passwdFocus() {
    this.passwdfocus = true;
    this.passwdblur = false;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.submitted = false;
    // this.setCurrentPasswordStyles();
  }

  // 邮箱格式校验
  private checkEmail(raw_email: string) {
    const emailRegex = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/;
    if (emailRegex.test(raw_email)) {
      return true;  // 合法的邮箱格式
    } else {
      return false;
    }
  }

  // blur事件,做控件状态变更和邮箱格式校验
  blurEmailCheck() {
    this.usernameblur = true;
    this.usernamefocus = false;
    if (this.checkEmail(this.user.username)) {
      return true;
    }else {
      return false;
    }
  }

  // 查看状态，决定是否显示邮箱错误的气泡
  invalidEmailFormat() {
    // 用户什么都没输或者输入了又删掉了（即控件内的值不为空），且没有输入一堆无效字符
    if (!( isUndefined(this.user.username) || this.user.username === '' ) && !(/\s+/.test(this.user.username))) {
      // 检查一下email格式
      if (this.checkEmail(this.user.username) || this.usernamefocus) {
        return false;  // 格式正确或者有光标在 气泡不显示
      } else {
        return true;  // 格式不对且失去焦点时 气泡显示
      }
    } else {

      return false;
    }
  }


  // 查看状态,决定提交后是否显示空用户名的气泡
  invalidSubmitUsername() {
    if (this.submitted) {
      if ( isUndefined(this.user.username) || this.user.username === '' || /\s+/.test(this.user.username) ) {
        return true;  // 不合法的用户名输入,显示错误提示给用户
      } else {
        return false;
      }
    } else {

      return false;  // 用户没点提交键，不显示
    }
  }

  // 查看状态，不合法的用户名返回真（包括邮箱格式不正确，空格缩进换行分页等无效字符）,并更新当前输入框样式
  invalidUsername() {
    if ( this.invalidEmailFormat() || this.invalidSubmitUsername() ) {
      return true;
    } else {
      return false;
    }
  }

  // 用户提交时查看password状态，决定气泡提示是否显示, 只在用户名没错时才检查密码
  invalidPassword() {
    if (this.submitted && !this.passwdfocus && !this.invalidUsername()) {
      if ((isUndefined(this.user.password) || this.user.password === '' || /\s+/.test(this.user.password))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // 登陆键被点击
  submit() {
    this.submitted = true;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.passwdfocus = false;
    this.passwdblur = true;
    // 根据错误校验状态，关闭开启光标状态
    if (this.invalidUsername()) {
      console.log('用户名通不过校验');
    } else if (this.invalidPassword()) {
      console.log('密码通不过校验');
    } else {
      // 当所有检查都通过了，去服务器申请登陆
      this.loading = true;
      this.submitted = false;
      this.authenticationService.login(this.user.username, this.user.password)
        .subscribe(
          data => {
            this.router.navigate([this.returnUrl]);
            this.loading = false;
          },
          error => {
            this.alertService.error(error);
            this.loading = false;
          });
    }

  }

}


