import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<void>();
  constructor(private el: ElementRef<HTMLElement>) {}
  @HostListener('document:click', ['$event']) onDocClick(event: MouseEvent) {
    const t = event.target as HTMLElement | null;
    if (t && !this.el.nativeElement.contains(t)) this.appClickOutside.emit();
  }
}

