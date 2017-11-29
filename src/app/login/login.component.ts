import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AlertService, AuthenticationService} from '../_services/index';
import {isUndefined} from 'util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  // local username, password, confirmpassword
  private username: string;
  private password: string;
  // component's status flags
  private loading: boolean;  // 正在去服务器申请登陆中的状态
  private submitted: boolean;  // 用户已经按下登陆键时为真
  private usernamefocus: boolean;  // 光标是否聚焦
  private usernameblur: boolean;
  private passwdfocus: boolean;
  private passwdblur: boolean;

  returnUrl: string;  // 成功登陆后返回的URL
  currentStyles: {};  // 当前username输入框的样式
  currentPasswordStyles: {};  // 当前password输入框的样式ß

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  // 查看username控件的样式设置
  setCurrentStyles() {
    this.currentStyles = {
      'box-shadow': this.usernamefocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidUsername() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentStyles;
  }

  // 查看password控件的样式设置
  setCurrentPasswordStyles() {
    this.currentPasswordStyles = {
      'box-shadow': this.passwdfocus && !this.submitted ? '0 0 10px #4169E1' : this.invalidPassword() ? '0 0 10px #B22222' : 'none',
    };
    return this.currentPasswordStyles;
  }

  // 当前输入框样式监听
  invalidUsername() {
    if (this.invalidFormat() || this.invalidSubmitUsername()) {
      return true;
    } else {
      return false;
    }
  }

  // 初始化执行函数
  ngOnInit() {
    this.loading = false;
    this.submitted = false;
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

  }

  // 光标聚焦到password输入框的事件
  passwdFocus() {
    this.passwdfocus = true;
    this.passwdblur = false;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.submitted = false;
  }

  // 邮箱格式校验
  private checkEmail(raw_email: string): boolean {
    // 格式检测对字符串前后的无效字符例如空格是容忍的
    const emailRegex = /^\s*[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}\s*$/;
    if (emailRegex.test(raw_email)) {
      return true;  // 合法的邮箱格式
    } else {
      console.log('invalid email address');
      return false;
    }
  }

  // 手机号格式校验 1** ********
  private checkPhone(raw_phone: string): boolean {
    // 根据移动联通电信三大运营商的号码 正则表达式前3位随时保持更新 后面是8位数字
    const PhoneReg = /^\s*((13[0-9])|(14[5|7])|(15([0|3]|[5-9]))|(18[0,5-9])|(17[0-9]))\d{8}\s*$/;
    if (PhoneReg.test(raw_phone)) {
      return true;  // 合法手机号
    } else {
      // console.log('invalid phone number');
      return false;
    }
  }

  // 用户名blur事件,只关心描述控件的状态位
  usernameBlur() {
    this.usernameblur = true;
    this.usernamefocus = false;
  }

  // 判别邮箱格式，只关心绑定的数据
  invalidEmailFormat(): boolean {
    // 先做输入值非空检查
    // 用户什么都没输(pristine)或者输入了又删掉了（novalue）, 或者输入一串空格之类的无效字符，检测器都不进行格式检查
    if (!( isUndefined(this.username) || this.username === '' ) && !(/^\s+$/.test(this.username))) {
      // 检查一下email格式
      if (this.checkEmail(this.username) || this.usernamefocus) {
        return false;  // email格式正确，或者光标定位在控件上时认为处于待修改状态 气泡也不显示
      } else {
        return true;  // email格式不对且失去焦点时 气泡显示
      }
    } else {
      return false;
    }
  }


  // 判别phone格式是否错误
  invalidPhoneFormat(): boolean {
    if (!( isUndefined(this.username) || this.username === '' ) && !(/^\s+$/.test(this.username))) {
      // 检查一下phone格式
      if (this.checkPhone(this.username) || this.usernamefocus) {
        return false;  // phone格式正确,光标定位在控件上时认为处于待修改状态，也不显示
      } else {
        return true;  // phone格式不对
      }
    } else {
      return false;
    }
  }

  // 查询状态，决定是否显示格式错误的气泡
  invalidFormat(): boolean {
    // 两种格式有一种通过就认为没错
    if (!this.invalidEmailFormat() || !this.invalidPhoneFormat()) {
      // console.log('不认为格式有误');
      return false;
    } else {
      return true;
    }
  }

  // 查看状态,决定提交后是否显示空用户名的气泡
  invalidSubmitUsername(): boolean {
    if (this.submitted) {
      // 非空检查
      if (isUndefined(this.username) || this.username === '' || /^\s+$/.test(this.username)) {
        // console.log('提交的用户名为空');
        return true;  // 不合法的用户名输入,显示错误提示给用户
      } else {
        return false;
      }
    } else {
      return false;  // 用户没点提交键，不显示
    }
  }

  // 用户提交时查看password状态，决定气泡提示是否显示, 只在用户名没错时才检查密码
  invalidPassword(): boolean {
    if (this.submitted && !this.passwdfocus && !this.invalidUsername()) {
      if ((isUndefined(this.password) || this.password === '' || /\s+/.test(this.password))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // 登陆键被点击
  login() {
    this.submitted = true;
    this.usernamefocus = false;
    this.usernameblur = true;
    this.passwdfocus = false;
    this.passwdblur = true;
    // 根据错误校验状态，关闭开启光标状态
    if (this.invalidUsername()) {
      // console.log('用户名通不过校验');
    } else if (this.invalidPassword()) {
      // console.log('密码通不过校验');
    } else {
      // 当所有检查都通过了，去服务器申请登陆
      this.loading = true;
      this.submitted = false;
      this.authenticationService.login(this.username, this.password)
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


